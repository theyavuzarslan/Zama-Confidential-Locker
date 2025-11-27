// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "encrypted-types/EncryptedTypes.sol";
import "./IConfidentialERC20.sol";

contract MockConfidentialERC20 is IConfidentialERC20 {
    mapping(address => euint128) internal balances;
    mapping(address => mapping(address => euint128)) internal allowances;

    function mint(address to, uint128 amount) external {
        balances[to] = FHE.add(balances[to], FHE.asEuint128(amount));
    }

    function transfer(address to, euint128 amount) external override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, euint128 amount) external override returns (bool) {
        // Check allowance (omitted for mock simplicity, or use FHE.le)
        _transfer(from, to, amount);
        return true;
    }

    function approve(address spender, euint128 amount) external override returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function balanceOf(address account) external view override returns (euint128) {
        return balances[account];
    }

    function _transfer(address from, address to, euint128 amount) internal {
        // Ensure balance >= amount
        ebool canTransfer = FHE.le(amount, balances[from]);
        euint128 amountToTransfer = FHE.select(canTransfer, amount, FHE.asEuint128(0));

        balances[from] = FHE.sub(balances[from], amountToTransfer);
        balances[to] = FHE.add(balances[to], amountToTransfer);
    }
}
