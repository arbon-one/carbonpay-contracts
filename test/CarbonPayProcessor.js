const {
  loadFixture,
} = require('@nomicfoundation/hardhat-network-helpers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
const { expect } = require('chai');
const { ContractFunctionVisibility } = require('hardhat/internal/hardhat-network/stack-traces/model');

describe('CarbonNFT', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('CarbonToken');
    const NFT = await ethers.getContractFactory('CarbonPayNFT');
    const Pay = await ethers.getContractFactory('CarbonPayProcessor');
    const token = await Token.deploy();
    const nft = await NFT.deploy();
    const pay = await Pay.deploy(
      nft.address
    );
    return { token, pay, nft, owner, otherAccount };
  }

  describe('Manage Tokens', function () {
    it('Should add token address to the list', async function () {
      const { pay, token } = await loadFixture(deployFixture);
      await pay.addTokenToAllowlist(token.address);
      expect(await pay.allowedTokens(token.address)).to.be.true;
    });

    it('Should not add token address to the list if not an admin', async function () {
      const { pay, token, otherAccount } = await loadFixture(deployFixture);
      await expect(pay.connect(otherAccount).addTokenToAllowlist(token.address)).to.be.reverted;
    });

    it('Should remove token address to the list', async function () {
      const { pay, token } = await loadFixture(deployFixture);
      await pay.removeTokenFromAllowList(token.address);
      expect(await pay.allowedTokens(token.address)).to.be.false;
    });

    it('Should not remove token address to the list if not an admin', async function () {
      const { pay, token, otherAccount } = await loadFixture(deployFixture);
      await expect(pay.connect(otherAccount).removeTokenFromAllowList(token.address)).to.be.reverted;
    });
  });
});