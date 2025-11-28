// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

interface ICoprocessor {
    event RequestSent(uint256 indexed requestId, bytes input, bytes4 callbackSelector);

    function request(bytes calldata input, bytes4 callbackSelector) external returns (uint256 requestId);
}
