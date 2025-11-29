// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ICoprocessor.sol";
import "./IComplianceRegistry.sol";

interface ILockerPass {
    function mint(address to) external returns (uint256);
    function burn(uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract ConfidentialLocker is Ownable {
    using SafeERC20 for IERC20;

    // External contracts
    ICoprocessor public coprocessor;
    ILockerPass public lockerPass;
    IComplianceRegistry public complianceRegistry;

    // Lock structure for confidential token locking
    struct Lock {
        address user;
        address token;              // address(0) = ETH
        uint256 amount;
        bytes encryptedUnlockTime;  // Encrypted unlock timestamp
        bytes encryptedKPI;         // Encrypted KPI threshold
        uint256 nftId;              // Associated LockerPass NFT
        bool withdrawn;
    }

    // Withdrawal request structure (for Coprocessor callback)
    struct WithdrawRequest {
        uint256 lockId;
        address user;
        bool pending;
    }

    // Storage
    mapping(uint256 => Lock) public locks;
    mapping(uint256 => WithdrawRequest) public withdrawRequests;
    uint256 public nextLockId;

    // Events
    event LockCreated(uint256 indexed lockId, address indexed user, uint256 nftId, address token, uint256 amount);
    event WithdrawRequested(uint256 indexed requestId, uint256 indexed lockId, address indexed user);
    event WithdrawResult(uint256 indexed requestId, uint256 indexed lockId, bool success);
    event LockWithdrawn(uint256 indexed lockId, address indexed user, uint256 amount);

    constructor(
        address _coprocessor,
        address _lockerPass,
        address _complianceRegistry
    ) Ownable(msg.sender) {
        coprocessor = ICoprocessor(_coprocessor);
        lockerPass = ILockerPass(_lockerPass);
        complianceRegistry = IComplianceRegistry(_complianceRegistry);
    }

    /**
     * @notice Lock tokens with encrypted unlock conditions
     * @param token Token address (address(0) for ETH)
     * @param amount Amount to lock (ignored for ETH, uses msg.value)
     * @param encryptedUnlockTime Encrypted unlock timestamp
     * @param encryptedKPI Encrypted KPI threshold for conditional unlock
     * @return lockId The ID of the created lock
     */
    function lock(
        address token,
        uint256 amount,
        bytes calldata encryptedUnlockTime,
        bytes calldata encryptedKPI
    ) external payable returns (uint256 lockId) {
        // Compliance check
        require(complianceRegistry.isAllowed(msg.sender), "User not allowed");

        uint256 lockAmount;

        if (token == address(0)) {
            // ETH lock
            require(msg.value > 0, "ETH amount must be greater than 0");
            lockAmount = msg.value;
        } else {
            // ERC20 token lock
            require(amount > 0, "Token amount must be greater than 0");
            require(msg.value == 0, "Cannot send ETH with token lock");
            lockAmount = amount;
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        // Mint LockerPass NFT to user
        uint256 nftId = lockerPass.mint(msg.sender);

        // Create lock
        lockId = nextLockId++;
        locks[lockId] = Lock({
            user: msg.sender,
            token: token,
            amount: lockAmount,
            encryptedUnlockTime: encryptedUnlockTime,
            encryptedKPI: encryptedKPI,
            nftId: nftId,
            withdrawn: false
        });

        emit LockCreated(lockId, msg.sender, nftId, token, lockAmount);
    }

    /**
     * @notice Request withdrawal with current KPI value
     * @dev The Coprocessor will evaluate if unlock conditions are met
     * @param lockId The lock to withdraw from
     * @param currentKPI Current KPI value for condition evaluation
     */
    function withdraw(uint256 lockId, bytes calldata currentKPI) external {
        Lock storage userLock = locks[lockId];
        
        require(userLock.user == msg.sender, "Not lock owner");
        require(!userLock.withdrawn, "Already withdrawn");
        require(userLock.amount > 0, "Lock is empty");

        // Verify NFT ownership (user must still hold the LockerPass)
        require(lockerPass.ownerOf(userLock.nftId) == msg.sender, "Must hold LockerPass NFT");

        // Encode input for Coprocessor:
        // - lockId, user, encryptedUnlockTime, encryptedKPI, currentKPI
        bytes memory input = abi.encode(
            lockId,
            msg.sender,
            userLock.encryptedUnlockTime,
            userLock.encryptedKPI,
            currentKPI
        );

        // Send request to Coprocessor for encrypted condition evaluation
        uint256 requestId = coprocessor.request(input, this.withdrawCallback.selector);

        withdrawRequests[requestId] = WithdrawRequest({
            lockId: lockId,
            user: msg.sender,
            pending: true
        });

        emit WithdrawRequested(requestId, lockId, msg.sender);
    }

    /**
     * @notice Callback from Coprocessor with unlock result
     * @param requestId The request ID
     * @param result Whether unlock conditions are met
     */
    function withdrawCallback(uint256 requestId, bool result) external {
        require(msg.sender == address(coprocessor), "Only coprocessor can call back");
        
        WithdrawRequest storage req = withdrawRequests[requestId];
        require(req.pending, "Request not pending");

        req.pending = false;
        
        Lock storage userLock = locks[req.lockId];
        
        emit WithdrawResult(requestId, req.lockId, result);

        if (result && !userLock.withdrawn) {
            userLock.withdrawn = true;
            uint256 amount = userLock.amount;
            address user = req.user;
            address token = userLock.token;

            // Burn the LockerPass NFT
            lockerPass.burn(userLock.nftId);

            // Transfer funds
            if (token == address(0)) {
                // ETH transfer
                (bool success, ) = user.call{value: amount}("");
                require(success, "ETH transfer failed");
            } else {
                // ERC20 transfer
                IERC20(token).safeTransfer(user, amount);
            }

            emit LockWithdrawn(req.lockId, user, amount);
        }
    }

    /**
     * @notice Get lock details
     * @param lockId The lock ID
     */
    function getLock(uint256 lockId) external view returns (
        address user,
        address token,
        uint256 amount,
        uint256 nftId,
        bool withdrawn
    ) {
        Lock storage userLock = locks[lockId];
        return (
            userLock.user,
            userLock.token,
            userLock.amount,
            userLock.nftId,
            userLock.withdrawn
        );
    }

    /**
     * @notice Check if a lock exists and is active
     * @param lockId The lock ID
     */
    function isLockActive(uint256 lockId) external view returns (bool) {
        Lock storage userLock = locks[lockId];
        return userLock.amount > 0 && !userLock.withdrawn;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
