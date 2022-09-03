// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title burnable contract
 * @dev destruct the contract and send coins to itself
 */
contract CarbonBurn {
  constructor() payable {
    selfdestruct(payable(address(this)));
  }
}