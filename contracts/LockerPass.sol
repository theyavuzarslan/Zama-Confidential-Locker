// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LockerPass is ERC721, Ownable {
    uint256 public nextTokenId;
    address public locker;

    constructor() ERC721("LockerPass", "LOCK") Ownable(msg.sender) {}

    function setLocker(address _locker) external onlyOwner {
        locker = _locker;
    }

    function mint(address to) external returns (uint256) {
        require(msg.sender == locker, "Only locker can mint");
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        nextTokenId++;
        return tokenId;
    }

    function burn(uint256 tokenId) external {
        require(msg.sender == locker, "Only locker can burn");
        _burn(tokenId);
    }
}
