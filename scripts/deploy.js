// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("CarbonToken");
  const NFT = await hre.ethers.getContractFactory("CarbonPayNFT");
  const Pay = await hre.ethers.getContractFactory("CarbonPayProcessor");
  const token = await Token.deploy();
  await token.deployed();
  const nft = await NFT.deploy();
  await nft.deployed();
  const pay = await Pay.deploy(
    nft.address
  );
  await pay.deployed();

  console.log('CarbonToken: ', token.address);
  console.log('CarbonPayNFT: ', nft.address);
  console.log('CarbonPay: ', pay.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
