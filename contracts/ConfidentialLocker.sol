// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICoprocessor.sol";

contract ConfidentialLocker is Ownable {
    ICoprocessor public coprocessor;

    struct Request {
        address user;
        uint256 amount;
        bool pending;
    }

    mapping(address => uint256) public balances;
    mapping(uint256 => Request) public requests;

    event Deposit(address indexed user, uint256 amount);
    event UnlockRequested(uint256 indexed requestId, address indexed user);
    event UnlockResult(uint256 indexed requestId, bool success);
    event Withdrawal(address indexed user, uint256 amount);

    constructor(address _coprocessor) Ownable(msg.sender) {
        coprocessor = ICoprocessor(_coprocessor);
    }

    function deposit() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // Request unlock based on encrypted conditions (handled off-chain)
    // encryptedKPI is passed to the Coprocessor to be evaluated against the condition
    function requestUnlock(bytes calldata encryptedKPI) external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        // Encode the input for the Coprocessor
        // In a real scenario, we might pass the encryptedKPI and the condition (e.g., threshold)
        bytes memory input = abi.encode(msg.sender, encryptedKPI);

        // Send request to Coprocessor
        uint256 requestId = coprocessor.request(input, this.unlockCallback.selector);
        
        requests[requestId] = Request({
            user: msg.sender,
            amount: amount,
            pending: true
        });

        emit UnlockRequested(requestId, msg.sender);
    }

    // Callback from Coprocessor
    function unlockCallback(uint256 requestId, bool result) external {
        require(msg.sender == address(coprocessor), "Only coprocessor can call back");
        Request storage req = requests[requestId];
        require(req.pending, "Request not pending");

        req.pending = false;
        emit UnlockResult(requestId, result);

        if (result) {
            uint256 amount = req.amount;
            balances[req.user] = 0;
            (bool success, ) = req.user.call{value: amount}("");
            require(success, "Transfer failed");
            emit Withdrawal(req.user, amount);
        }
    }
}
