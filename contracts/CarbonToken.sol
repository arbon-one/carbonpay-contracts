// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonToken is ERC20, Ownable {
  uint256 public slon = 0;

  constructor() ERC20("CarbonToken", "CT") {
    _mint(msg.sender, 100 * 10 ** 18);
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function burn(address sender, uint256 amount) external {
    _burn(sender, amount);
  }
}