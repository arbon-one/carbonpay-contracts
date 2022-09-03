// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICarbonBurner {
  function purge(uint256 value) external payable returns(address);
}

interface INFT {
  function updateOffset(address merchant, uint256 _offset) external returns(bool);
}

contract CarbonPayProcessor is AccessControl {
    address burnContractAddress;
    address nftContractAddress;
    mapping(address => bool) allowedTokens;

    constructor(
        address _burnContractAddress,
        address _nftContractAddress
    ) {
        burnContractAddress = _burnContractAddress;
        nftContractAddress = _nftContractAddress;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addToAllowlist(address token) public onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedTokens[token] = true;
    }

    function removeFromAllowList(address token) public onlyRole(DEFAULT_ADMIN_ROLE) {
        delete allowedTokens[token];
    }

    function purge() internal {
        ICarbonBurner(burnContractAddress).purge{value: msg.value};
    }

    function updateOffset(address _merchant, uint256 _offset) internal {
        INFT(nftContractAddress).updateOffset(_merchant, _offset);
    }

    function pay(address merchant, address token) public payable {
        // require(allowedTokens[token], "Token is not allowed.");
        
        purge();
        updateOffset(merchant, msg.value);
    }
}