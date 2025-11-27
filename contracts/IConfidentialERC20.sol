// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "encrypted-types/EncryptedTypes.sol";

interface IConfidentialERC20 {
    function transfer(address to, euint128 amount) external returns (bool);
    function transferFrom(address from, address to, euint128 amount) external returns (bool);
    function approve(address spender, euint128 amount) external returns (bool);
    function balanceOf(address account) external view returns (euint128);
}
