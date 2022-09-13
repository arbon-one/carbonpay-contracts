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

    const CarbonNFT = await ethers.getContractFactory('CarbonPayNFT');
    const carbonNFT = await CarbonNFT.deploy();
    return { carbonNFT, owner, otherAccount };
  }

  describe('Mint', function () {
    it('Anyone should be able to mint', async function () {
      const { carbonNFT, owner, otherAccount } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, `Merchant Name #${Math.random() * 10000}`);
      await carbonNFT.connect(otherAccount).safeMint(otherAccount.address, `Merchant Name #${Math.random() * 10000}`);
      expect(await carbonNFT.balanceOf(owner.address)).to.eq(1);
      expect(await carbonNFT.balanceOf(otherAccount.address)).to.eq(1);
    });

    it('Should be able to mint only one per address', async function () {
      const { carbonNFT, owner, otherAccount } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, `Merchant Name #${Math.random() * 10000}`);
      await expect(carbonNFT.safeMint(owner.address, `Merchant Name #${Math.random() * 10000}`)).to.revertedWith('Address is already registered.');
    });

    it('Token IDs start with 1', async function () {
      const { carbonNFT, owner } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, 'Merchant Name');
      expect(await carbonNFT.getTokenIdByAddress(owner.address)).to.eq(1);
    });

    it('Mint should increment token count correctly', async function () {
      const { carbonNFT, owner, otherAccount } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, 'Merchant Name 1');
      await carbonNFT.safeMint(otherAccount.address, 'Merchant Name 2');
      expect(await carbonNFT.totalSupply()).to.eq(2);
    });

    it('Mint should set correct attributes', async function () {
      const { carbonNFT, owner } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, 'Merchant Name');
      expect((await carbonNFT.attributes(1)).name).to.eq('Merchant Name');
      expect((await carbonNFT.attributes(1)).offset).to.eq(0);
    });
  });

  describe('Metadata', function () {
    it('OFFSET_MODIFIER_ROLE should correctly update offset', async function () {
      const { carbonNFT, owner } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, 'Merchant Name 1');
      await carbonNFT.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OFFSET_MODIFIER_ROLE')), owner.address);
      await carbonNFT.updateOffset(owner.address, ethers.utils.parseEther('100'));
      expect((await carbonNFT.attributes(1)).offset).to.eq(100);
    })

    it('Non-OFFSET_MODIFIER_ROLE should NOT be able to update offset', async function () {
      const { carbonNFT, owner } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, 'Merchant Name 1');
      await expect(carbonNFT.updateOffset(owner.address, 100)).to.be.reverted;
    })

    it('DEFAULT_ADMIN_ROLE should correctly update info', async function () {
      const { carbonNFT, owner } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, 'Merchant Name 1');
      await carbonNFT.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('DEFAULT_ADMIN_ROLE')), owner.address);
      await carbonNFT.updateInfo(1, 'Other Merchant Name')
      expect((await carbonNFT.attributes(1)).name).to.eq('Other Merchant Name');
    })

    it('Non-DEFAULT_ADMIN_ROLE should NOT be able to update info', async function () {
      const { carbonNFT, owner, otherAccount } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, 'Merchant Name 1');
      await expect(carbonNFT.connect(otherAccount).updateInfo(1, 'Other Merchant Name')).to.be.reverted;
    })

    it('Should return correct tokenURI', async function () {
      const { carbonNFT, owner} = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, 'Merchant Name 1');
      await carbonNFT.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OFFSET_MODIFIER_ROLE')), owner.address);
      await carbonNFT.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('DEFAULT_ADMIN_ROLE')), owner.address);
      await carbonNFT.updateOffset(owner.address, ethers.utils.parseEther('100'));
      await carbonNFT.updateInfo(1, 'Other Merchant Name')
      expect(await carbonNFT.tokenURI(1)).to.eq('data:application/json;base64,eyJuYW1lIjogIk90aGVyIE1lcmNoYW50IE5hbWUiLCJpbWFnZV9kYXRhIjogIjEiLCJhdHRyaWJ1dGVzIjogW3sidHJhaXRfdHlwZSI6ICJvZmZzZXQiLCAidmFsdWUiOiAxMDB9LF19');
    });
  });
});