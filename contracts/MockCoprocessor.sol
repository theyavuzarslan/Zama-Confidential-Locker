// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "./ICoprocessor.sol";

contract MockCoprocessor is ICoprocessor {
    uint256 public nextRequestId;
    mapping(uint256 => address) public requestSender;
    mapping(uint256 => bytes4) public requestCallback;

    function request(bytes calldata /* input */, bytes4 callbackSelector) external override returns (uint256 requestId) {
        requestId = nextRequestId++;
        requestSender[requestId] = msg.sender;
        requestCallback[requestId] = callbackSelector;
        
        // In a real scenario, this event is picked up by the Relayer
        emit RequestSent(requestId, msg.data, callbackSelector);
    }

    // Function to simulate the Relayer calling back with the result
    function fulfillRequest(uint256 requestId, bool result) external {
        address sender = requestSender[requestId];
        bytes4 selector = requestCallback[requestId];
        
        require(sender != address(0), "Request not found");

        // Call the callback function on the sender
        (bool success, ) = sender.call(abi.encodeWithSelector(selector, requestId, result));
        require(success, "Callback failed");
    }
}
