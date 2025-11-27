// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IComplianceRegistry.sol";

contract ComplianceRegistry is IComplianceRegistry, Ownable {
    mapping(address => bool) public allowed;
    bool public whitelistEnabled;

    event UserAllowed(address indexed user, bool allowed);
    event WhitelistEnabled(bool enabled);

    constructor() Ownable(msg.sender) {
        whitelistEnabled = false; // Default to open, can be enabled later
    }

    function setWhitelistEnabled(bool _enabled) external onlyOwner {
        whitelistEnabled = _enabled;
        emit WhitelistEnabled(_enabled);
    }

    function setAllowed(address _user, bool _allowed) external onlyOwner {
        allowed[_user] = _allowed;
        emit UserAllowed(_user, _allowed);
    }

    function isAllowed(address _user) external view override returns (bool) {
        if (!whitelistEnabled) {
            return true;
        }
        return allowed[_user];
    }
}
