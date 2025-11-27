// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "encrypted-types/EncryptedTypes.sol";
import "./IConfidentialERC20.sol";
import "./IMockDEX.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ConfidentialBuyback is Ownable {
    struct BuybackConfig {
        euint128 buybackAmount; // Amount of stablecoin to spend per interval
        euint32 interval;       // Time between buybacks (seconds)
        euint32 lastBuybackTime;
        euint32 targetPrice;    // Buy if price < target (optional KPI)
        bool isActive;
    }

    BuybackConfig public config;
    address public stablecoin;
    address public projectToken;
    address public dex;

    event BuybackExecuted(uint256 timestamp);
    event FundsDeposited(address indexed depositor, uint256 amount);

    constructor(address _stablecoin, address _projectToken, address _dex) Ownable(msg.sender) {
        stablecoin = _stablecoin;
        projectToken = _projectToken;
        dex = _dex;
    }

    function configureBuyback(
        externalEuint128 _buybackAmount,
        bytes calldata _amountProof,
        externalEuint32 _interval,
        bytes calldata _intervalProof,
        externalEuint32 _targetPrice,
        bytes calldata _priceProof
    ) external onlyOwner {
        config.buybackAmount = FHE.fromExternal(_buybackAmount, _amountProof);
        config.interval = FHE.fromExternal(_interval, _intervalProof);
        config.targetPrice = FHE.fromExternal(_targetPrice, _priceProof);
        config.lastBuybackTime = FHE.asEuint32(0);
        config.isActive = true;
    }

    function depositFunds(uint256 _amount) external {
        // We assume stablecoin is a standard ERC20 for deposit, 
        // but we might need to wrap it or use IConfidentialERC20 if it's FHE native.
        // For this PoC, let's assume IConfidentialERC20 to keep it consistent with Locker.
        // But wait, if IConfidentialERC20 transferFrom takes euint128, we need encrypted amount.
        // If the user sends public tokens, we need to "shield" them.
        // Let's assume the user has already shielded them or we use the Mock which takes euint128.
        
        // Actually, for simplicity in PoC, let's assume the user approves the contract 
        // and we pull encrypted tokens? No, standard approval is for public amount.
        
        // Let's stick to the pattern in ConfidentialLocker: 
        // The user provides encrypted amount for the logic, but the transfer might need to be handled carefully.
        // In MockConfidentialERC20, transferFrom takes euint128.
        
        // Let's assume the caller passes an encrypted amount for the deposit?
        // Or we just use a public deposit for the treasury (common use case: treasury is public, strategy is private).
        // BUT, if we want to hide the buyback amount, the treasury balance should ideally be hidden too?
        // Let's use IConfidentialERC20 for everything.
        
        // Implementation detail: We need `depositFunds` to take encrypted amount if we want to keep it private.
        // But usually "Deposit" is just a transfer.
    }
    
    // Revised deposit that just accepts transfer
    function depositEncrypted(externalEuint128 _encryptedAmount, bytes calldata _amountProof) external {
        euint128 amount = FHE.fromExternal(_encryptedAmount, _amountProof);
        IConfidentialERC20(stablecoin).transferFrom(msg.sender, address(this), amount);
        emit FundsDeposited(msg.sender, 0); // Don't reveal amount in event
    }

    function executeBuyback(uint256 _currentPrice) external {
        require(config.isActive, "Buyback not active");

        // 1. Check Time Condition: block.timestamp >= lastBuybackTime + interval
        euint32 currentTime = FHE.asEuint32(uint32(block.timestamp));
        euint32 nextBuybackTime = FHE.add(config.lastBuybackTime, config.interval);
        ebool isTimeReady = FHE.ge(currentTime, nextBuybackTime);

        // 2. Check Price Condition: currentPrice < targetPrice
        // Note: _currentPrice is public here (from oracle). 
        // If we want to keep targetPrice private, we encrypt _currentPrice and compare.
        euint32 currentPriceEnc = FHE.asEuint32(uint32(_currentPrice));
        ebool isPriceGood = FHE.lt(currentPriceEnc, config.targetPrice);

        // 3. Combine Conditions: Time AND Price
        ebool shouldBuy = FHE.and(isTimeReady, isPriceGood);

        // 4. Determine Amount to Spend
        euint128 zero = FHE.asEuint128(0);
        euint128 amountToSpend = FHE.select(shouldBuy, config.buybackAmount, zero);

        // 5. Update State (only if bought)
        // We update lastBuybackTime. If we didn't buy, we shouldn't update? 
        // Or we update it to "now" if we bought?
        // FHE.select for new time: if bought, newTime = currentTime; else, oldTime.
        config.lastBuybackTime = FHE.select(shouldBuy, currentTime, config.lastBuybackTime);

        // 6. Execute Swap
        // We need to approve DEX first (can be done once or per swap).
        IConfidentialERC20(stablecoin).approve(dex, amountToSpend);
        
        // For PoC, we skip the actual swap since standard DEXes don't support encrypted amounts.
        // In production, this would call a privacy-preserving DEX or use makePubliclyDecryptable + relayer pattern.
        // For now, we just emit the event if amount > 0 (checked via encrypted comparison).
        
        // We can't check if amountToSpend > 0 without decryption, so we always emit.
        // The actual transfer will be 0 if conditions weren't met.
        emit BuybackExecuted(block.timestamp);
    }
}
