// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./CarbonBurn.sol";

/**
 * @title coin burning
 * @dev Implements the a contract to create CarbonBurn contract
 */
contract CarbonBurner {
  function purge(uint256 value) public payable returns (address){
    CarbonBurn burnAddress = (new CarbonBurn){value: value}();
    return address(burnAddress);
  }
}