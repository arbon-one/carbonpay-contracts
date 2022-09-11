// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface INFT {
    function updateOffset(address merchant, uint256 _offset) external;
    function totalSupply() external view returns(uint256);
}

interface IToken {
    function burn(address merchant, uint256 amount) external;
}

contract CarbonPayProcessor is AccessControl {
    address burnContractAddress;
    address nftContractAddress;
    mapping(address => bool) public allowedTokens;

    constructor(
        address _burnContractAddress,
        address _nftContractAddress
    ) {
        burnContractAddress = _burnContractAddress;
        nftContractAddress = _nftContractAddress;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addTokenToAllowlist(address tokenAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedTokens[tokenAddress] = true;
    }

    function removeTokenFromAllowList(address tokenAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedTokens[tokenAddress] = false;
    }

    function updateOffset(address merchant, uint256 offset) internal {
        INFT(nftContractAddress).updateOffset(merchant, offset);
    }

    function pay(address merchant, address token, uint256 amount) public payable {
        require(allowedTokens[token], "Token is not allowed.");

        IToken(token).burn(merchant, amount);
        updateOffset(merchant, amount);
    }
}