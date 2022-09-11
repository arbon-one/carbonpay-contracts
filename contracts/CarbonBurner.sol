// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./CarbonBurn.sol";

/**
 * @title coin burning
 * @dev Implements the a contract to create CarbonBurn contract
 */
contract CarbonBurner {
  function purge(uint256 amount) public payable returns (address){
    CarbonBurn burnAddress = (new CarbonBurn){value: amount}();
    return address(burnAddress);
  }
}