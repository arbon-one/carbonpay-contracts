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
    const Burner = await ethers.getContractFactory('CarbonBurner');
    const NFT = await ethers.getContractFactory('CarbonPayNFT');
    const Pay = await ethers.getContractFactory('CarbonPayProcessor');
    const burner = await Burner.deploy();
    const token = await Token.deploy();
    const nft = await NFT.deploy();
    const pay = await Pay.deploy(
      burner.address,
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

  describe('Pay', function () {
    it('Should burn tokens and update offset on NFT correctly', async function () {
      const { pay, token, nft, owner } = await loadFixture(deployFixture);
      await pay.addTokenToAllowlist(token.address);
      await nft.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OFFSET_MODIFIER_ROLE')), pay.address);
      await nft.safeMint(owner.address, 'Merchant Name');
      await pay.pay(owner.address, token.address, ethers.utils.parseEther('100'));
      expect(await token.balanceOf(owner.address)).to.be.equal(0);
      expect((await nft.attributes(1)).offset).to.eq(100);
    });
  });
});