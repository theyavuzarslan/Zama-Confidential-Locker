// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IMockDEX.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockDEX is IMockDEX {
    uint256 public constant RATE = 100; // 1 TokenIn = 100 TokenOut

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external override returns (uint256 amountOut) {
        // Transfer tokenIn from user to DEX
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate amountOut (Mock rate)
        amountOut = amountIn * RATE;
        
        // Transfer tokenOut to user (mint or transfer)
        // For mock, we assume DEX has infinite supply or mints
        // But standard ERC20 doesn't have mint.
        // We will just assume successful swap event for PoC without actual transfer out if we don't have balance.
        // Or we can use MockConfidentialERC20 which has mint?
        // But MockDEX interacts with standard ERC20 interface.
        
        // Let's try to transfer if we have balance, else just return amountOut
        try IERC20(tokenOut).transfer(msg.sender, amountOut) {
            // Success
        } catch {
            // Ignore failure for mock if no balance
        }
        
        return amountOut;
    }

    function getPrice(address tokenIn, address tokenOut) external view override returns (uint256) {
        return RATE;
    }
}
