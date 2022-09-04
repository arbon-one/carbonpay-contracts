// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface ICarbonToken {
  function burn(uint256 amount) external;
}

contract CarbonPayBurn is AccessControl {
  bytes32 public constant CARBON_PAY_PROCESSOR = keccak256("CARBON_PAY_PROCESSOR");

  constructor(
    address _carbonPayProcessorAddress
  ) {
    _grantRole(CARBON_PAY_PROCESSOR, _carbonPayProcessorAddress);
  }

  function burn(address tokenAddress, uint256 amount) public onlyRole(CARBON_PAY_PROCESSOR) {
    ICarbonToken(tokenAddress).burn(amount);
  }
}