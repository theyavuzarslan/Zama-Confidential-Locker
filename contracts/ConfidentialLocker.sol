// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "encrypted-types/EncryptedTypes.sol";
import "./IConfidentialERC20.sol";
import "./LockerPass.sol";
import "./IComplianceRegistry.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ConfidentialLocker is ReentrancyGuard {
    struct Lock {
        euint32 unlockTime;
        euint32 targetKPI; // New: Target KPI value (e.g., price, TVL)
        euint128 amount;
        address token;
        bool withdrawn;
    }

    mapping(uint256 => Lock) public locks;
    uint256 public nextLockId;
    LockerPass public lockerPass;
    IComplianceRegistry public registry;

    event LockCreated(uint256 indexed lockId, address indexed owner, address indexed token);
    event LockWithdrawn(uint256 indexed lockId, address indexed owner);

    constructor(address _lockerPass, address _registry) {
        lockerPass = LockerPass(_lockerPass);
        registry = IComplianceRegistry(_registry);
    }

    function lock(
        address _token, 
        externalEuint128 _encryptedAmount, 
        bytes calldata _amountProof, 
        externalEuint32 _encryptedTime, 
        bytes calldata _timeProof,
        externalEuint32 _encryptedKPI, // New: Encrypted KPI target
        bytes calldata _kpiProof
    ) external nonReentrant {
        require(registry.isAllowed(msg.sender), "Compliance: User not allowed");
        
        euint128 amount = FHE.fromExternal(_encryptedAmount, _amountProof);
        euint32 unlockTime = FHE.fromExternal(_encryptedTime, _timeProof);
        euint32 targetKPI = FHE.fromExternal(_encryptedKPI, _kpiProof);

        // Transfer encrypted tokens to this contract
        IConfidentialERC20(_token).transferFrom(msg.sender, address(this), amount);

        locks[nextLockId] = Lock({
            unlockTime: unlockTime,
            targetKPI: targetKPI,
            amount: amount,
            token: _token,
            withdrawn: false
        });
        
        // Mint NFT
        lockerPass.mint(msg.sender);

        emit LockCreated(nextLockId, msg.sender, _token);
        nextLockId++;
    }

    function withdraw(uint256 _lockId, uint256 _currentKPI) external nonReentrant {
        require(registry.isAllowed(msg.sender), "Compliance: User not allowed");
        
        Lock storage userLock = locks[_lockId];
        require(!userLock.withdrawn, "Already withdrawn");
        
        // 1. Check Time Condition: block.timestamp >= unlockTime
        euint32 currentTime = FHE.asEuint32(uint32(block.timestamp));
        ebool isTimeUnlocked = FHE.le(userLock.unlockTime, currentTime);
        
        // 2. Check KPI Condition: currentKPI >= targetKPI
        // We assume _currentKPI is public (from oracle). If private, pass encrypted.
        euint32 currentKPIEnc = FHE.asEuint32(uint32(_currentKPI));
        ebool isKPIUnlocked = FHE.le(userLock.targetKPI, currentKPIEnc);
        
        // 3. Combine: (Time OR KPI) or (Time AND KPI)?
        // Requirement says "unlock tokens based on specific KPIs". 
        // Usually it's Time OR KPI (early unlock if KPI met), or Time AND KPI (vesting dependent on performance).
        // Let's assume Time AND KPI for strictness, OR let user decide?
        // For this PoC, let's do Time AND KPI (both must be met). 
        // Wait, if I want just Time, I set KPI to 0. If I want just KPI, I set Time to 0.
        // So AND logic works best for flexibility.
        ebool isUnlocked = FHE.and(isTimeUnlocked, isKPIUnlocked);
        
        // Select amount to transfer
        euint128 zero = FHE.asEuint128(0);
        euint128 amountToSend = FHE.select(isUnlocked, userLock.amount, zero);
        
        // Update remaining amount
        userLock.amount = FHE.sub(userLock.amount, amountToSend);
        
        // Transfer tokens
        IConfidentialERC20(userLock.token).transfer(msg.sender, amountToSend);
        
        emit LockWithdrawn(_lockId, msg.sender);
    }
}
