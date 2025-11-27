// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMockDEX {
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut);
    function getPrice(address tokenIn, address tokenOut) external view returns (uint256 price);
}
