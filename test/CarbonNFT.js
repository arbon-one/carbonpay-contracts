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

  describe('Deployment', function () {
    it('Should set MINTER_ROLE', async function () {
      const { carbonNFT, owner } = await loadFixture(deployFixture);
      const isAdmin = await carbonNFT.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')), owner.address);
      expect(isAdmin).to.equal(true);
    });
  });

  describe('Mint', function () {
    it('MINTER_ROLE allowed to mint', async function () {
      const { carbonNFT, owner } = await loadFixture(deployFixture);
      await carbonNFT.safeMint(owner.address, 'Merchant Name');
      expect(await carbonNFT.balanceOf(owner.address)).to.eq(1);
    });

    it('Non-MINTER_ROLE is NOT allowed to mint', async function () {
      const { carbonNFT, otherAccount } = await loadFixture(deployFixture);
      await expect(carbonNFT.connect(otherAccount).safeMint(otherAccount.address, 'Merchant Name')).to.be.reverted;
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
      await carbonNFT.updateOffset(owner.address, 100)
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
      await carbonNFT.updateOffset(owner.address, 100);
      await carbonNFT.updateInfo(1, 'Other Merchant Name')
      expect(await carbonNFT.tokenURI(1)).to.eq('data:application/json;base64,eyJuYW1lIjogIk90aGVyIE1lcmNoYW50IE5hbWUiLCJpbWFnZV9kYXRhIjogIjEiLCJhdHRyaWJ1dGVzIjogW3sidHJhaXRfdHlwZSI6ICJvZmZzZXQiLCAidmFsdWUiOiAxMDB9LF19');
    });
  });

  // describe('tokenUri', function () {
  //   it('Should return correct metadata for UArdian token', async function () {
  //     const { uardiansFam, owner } = await loadFixture(deployFixture);
  //     await uardiansFam.mint(owner.address, 1);
  //     expect(await uardiansFam.tokenURI(1)).to.be.equal('ipfs://bafybeibde27e22rnkwu4s3adw5x3w5mu4nx4xgnzycvrlnxfm2bx3qwsey/1.json');
  //   });

  //   it('Should return correct metadata for a Frame token if no Mykolaiv tokens', async function () {
  //     /**
  //      * NOTE, there is a small bug in the first UArdians contract that prevents 0 token (the very first one) from being returned by the `walletOfOwner` function.
  //      * As a workaround, I ignore the very first token.
  //      * As a result, despite 2 mints, I expect only one token in the wallet
  //      */
  //     const { uardians, uardiansFam, otherAccount, owner} = await loadFixture(deployFixture);
  //     await uardiansFam.mint(owner.address, 1);
  //     expect(await uardiansFam.tokenURI(501)).to.eq('data:application/json;base64,eyJuYW1lIjogIlVBcmRpYW5GYW0gIzUwMSIsImltYWdlX2RhdGEiOiAiPHN2ZyB2ZXJzaW9uPScxLjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgdmlld0JveD0nMCAwIDEyODAgMTI4MCcgd2lkdGg9JzEyODAnIGhlaWdodD0nMTI4MCc+PHRpdGxlPlVBcmRpYW5zRmFtPC90aXRsZT48ZGVmcz48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J2tvemFrJyBocmVmPSdodHRwczovL2JhZnliZWlna290dWlvYnZwa2t3ZmZiMnJvd3h2YXQzbWZzdGM3Y3hjMm55N2U0aTVkdHpzYjR0cWdxLmlwZnMubmZ0c3RvcmFnZS5saW5rLzUucG5nJz48L2ltYWdlPjxpbWFnZSB3aWR0aD0nMzAwMCcgaGVpZ2h0PSc0MDAwJyBpZD0na296YWsnIGhyZWY9J2h0dHBzOi8vYmFmeWJlaWdrb3R1aW9idnBra3dmZmIycm93eHZhdDNtZnN0YzdjeGMybnk3ZTRpNWR0enNiNHRxZ3EuaXBmcy5uZnRzdG9yYWdlLmxpbmsvMy5wbmcnPjwvaW1hZ2U+PGltYWdlIHdpZHRoPSczMDAwJyBoZWlnaHQ9JzQwMDAnIGlkPSdrb25vdG9wJyBocmVmPSdodHRwczovL2JhZnliZWlna290dWlvYnZwa2t3ZmZiMnJvd3h2YXQzbWZzdGM3Y3hjMm55N2U0aTVkdHpzYjR0cWdxLmlwZnMubmZ0c3RvcmFnZS5saW5rLzQucG5nJz48L2ltYWdlPjxpbWFnZSB3aWR0aD0nMzAwMCcgaGVpZ2h0PSc0MDAwJyBpZD0na2hhcmtpdicgaHJlZj0naHR0cHM6Ly9iYWZ5YmVpZ2tvdHVpb2J2cGtrd2ZmYjJyb3d4dmF0M21mc3RjN2N4YzJueTdlNGk1ZHR6c2I0dHFncS5pcGZzLm5mdHN0b3JhZ2UubGluay8xLnBuZyc+PC9pbWFnZT48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J29kZXNzYScgaHJlZj0naHR0cHM6Ly9iYWZ5YmVpZ2tvdHVpb2J2cGtrd2ZmYjJyb3d4dmF0M21mc3RjN2N4YzJueTdlNGk1ZHR6c2I0dHFncS5pcGZzLm5mdHN0b3JhZ2UubGluay8yLnBuZyc+PC9pbWFnZT48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J215a29sYWl2JyBocmVmPScnPjwvaW1hZ2U+PC9kZWZzPjxzdHlsZT48L3N0eWxlPjx1c2UgaHJlZj0nI2tvemFrJyB0cmFuc2Zvcm09J21hdHJpeCguMjc5LDAsMCwuMjg5LDIzOSwxMDgpJy8+PHVzZSBocmVmPScjemFwb3JpemhpYScgdHJhbnNmb3JtPSdtYXRyaXgoLjQ2MiwwLDAsLjQ2MiwtMTk5LDUzKScvPjx1c2UgaHJlZj0nI2tvbm90b3AnIHRyYW5zZm9ybT0nbWF0cml4KC40MTEsMCwwLC4zODIsMjc0LDE3MyknLz48dXNlIGhyZWY9JyNraGFya2l2JyB0cmFuc2Zvcm09J21hdHJpeCguMjQ4LDAsMCwuMjUxLC0xMTQsNDg3KScvPjx1c2UgaHJlZj0nI29kZXNzYScgdHJhbnNmb3JtPSdtYXRyaXgoLjMwMiwwLDAsLjI5NSw2NjgsMjYwKScvPiIsImF0dHJpYnV0ZXMiOiBbeyJ0cmFpdF90eXBlIjogIk15a29sYWl2IiwgInZhbHVlIjogIk5vbmUifSx7InRyYWl0X3R5cGUiOiAiS2hhcmtpdiIsICJ2YWx1ZSI6IDF9LHsidHJhaXRfdHlwZSI6ICJPZGVzc2EiLCAidmFsdWUiOiAiTm9uZSJ9LHsidHJhaXRfdHlwZSI6ICJaYXBvcml6aGlhVXJpIiwgInZhbHVlIjogIk5vbmUifSx7InRyYWl0X3R5cGUiOiAiS29ub3RvcCIsICJ2YWx1ZSI6ICJOb25lIn0seyJ0cmFpdF90eXBlIjogIkNvc3NhY2siLCAidmFsdWUiOiAiTm9uZSJ9XX0=')
  //   });

  //   it('Should return correct metadata for a Frame token if there is a Mykolaiv token', async function () {
  //     /**
  //      * NOTE, there is a small bug in the first UArdians contract that prevents 0 token (the very first one) from being returned by the `walletOfOwner` function.
  //      * As a workaround, I ignore the very first token.
  //      * As a result, despite 2 mints, I expect only one token in the wallet
  //      */
  //     const { uardians, uardiansFam, otherAccount, owner} = await loadFixture(deployFixture);
  //     await uardians.setPaused(false);
  //     await uardiansFam.mint(owner.address, 1);
  //     await uardians.connect(otherAccount).mint(1, {value: ethers.utils.parseEther('0.08')});
  //     await uardians.mint(1, {value: ethers.utils.parseEther('0.08')});
  //     expect(await uardiansFam.tokenURI(501)).to.eq('data:application/json;base64,eyJuYW1lIjogIlVBcmRpYW5GYW0gIzUwMSIsImltYWdlX2RhdGEiOiAiPHN2ZyB2ZXJzaW9uPScxLjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgdmlld0JveD0nMCAwIDEyODAgMTI4MCcgd2lkdGg9JzEyODAnIGhlaWdodD0nMTI4MCc+PHRpdGxlPlVBcmRpYW5zRmFtPC90aXRsZT48ZGVmcz48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J2tvemFrJyBocmVmPSdodHRwczovL2JhZnliZWlna290dWlvYnZwa2t3ZmZiMnJvd3h2YXQzbWZzdGM3Y3hjMm55N2U0aTVkdHpzYjR0cWdxLmlwZnMubmZ0c3RvcmFnZS5saW5rLzUucG5nJz48L2ltYWdlPjxpbWFnZSB3aWR0aD0nMzAwMCcgaGVpZ2h0PSc0MDAwJyBpZD0na296YWsnIGhyZWY9J2h0dHBzOi8vYmFmeWJlaWdrb3R1aW9idnBra3dmZmIycm93eHZhdDNtZnN0YzdjeGMybnk3ZTRpNWR0enNiNHRxZ3EuaXBmcy5uZnRzdG9yYWdlLmxpbmsvMy5wbmcnPjwvaW1hZ2U+PGltYWdlIHdpZHRoPSczMDAwJyBoZWlnaHQ9JzQwMDAnIGlkPSdrb25vdG9wJyBocmVmPSdodHRwczovL2JhZnliZWlna290dWlvYnZwa2t3ZmZiMnJvd3h2YXQzbWZzdGM3Y3hjMm55N2U0aTVkdHpzYjR0cWdxLmlwZnMubmZ0c3RvcmFnZS5saW5rLzQucG5nJz48L2ltYWdlPjxpbWFnZSB3aWR0aD0nMzAwMCcgaGVpZ2h0PSc0MDAwJyBpZD0na2hhcmtpdicgaHJlZj0naHR0cHM6Ly9iYWZ5YmVpZ2tvdHVpb2J2cGtrd2ZmYjJyb3d4dmF0M21mc3RjN2N4YzJueTdlNGk1ZHR6c2I0dHFncS5pcGZzLm5mdHN0b3JhZ2UubGluay8xLnBuZyc+PC9pbWFnZT48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J29kZXNzYScgaHJlZj0naHR0cHM6Ly9iYWZ5YmVpZ2tvdHVpb2J2cGtrd2ZmYjJyb3d4dmF0M21mc3RjN2N4YzJueTdlNGk1ZHR6c2I0dHFncS5pcGZzLm5mdHN0b3JhZ2UubGluay8yLnBuZyc+PC9pbWFnZT48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J215a29sYWl2JyBocmVmPScxLnBuZyc+PC9pbWFnZT48L2RlZnM+PHN0eWxlPjwvc3R5bGU+PHVzZSBocmVmPScja296YWsnIHRyYW5zZm9ybT0nbWF0cml4KC4yNzksMCwwLC4yODksMjM5LDEwOCknLz48dXNlIGhyZWY9JyN6YXBvcml6aGlhJyB0cmFuc2Zvcm09J21hdHJpeCguNDYyLDAsMCwuNDYyLC0xOTksNTMpJy8+PHVzZSBocmVmPScja29ub3RvcCcgdHJhbnNmb3JtPSdtYXRyaXgoLjQxMSwwLDAsLjM4MiwyNzQsMTczKScvPjx1c2UgaHJlZj0nI2toYXJraXYnIHRyYW5zZm9ybT0nbWF0cml4KC4yNDgsMCwwLC4yNTEsLTExNCw0ODcpJy8+PHVzZSBocmVmPScjb2Rlc3NhJyB0cmFuc2Zvcm09J21hdHJpeCguMzAyLDAsMCwuMjk1LDY2OCwyNjApJy8+PHVzZSBocmVmPScjbXlrb2xhaXYnIHRyYW5zZm9ybT0nbWF0cml4KC4yODYsMCwwLC4yOTEsMjIxLDQ5MyknLz4iLCJhdHRyaWJ1dGVzIjogW3sidHJhaXRfdHlwZSI6ICJNeWtvbGFpdiIsICJ2YWx1ZSI6IDF9LHsidHJhaXRfdHlwZSI6ICJLaGFya2l2IiwgInZhbHVlIjogMX0seyJ0cmFpdF90eXBlIjogIk9kZXNzYSIsICJ2YWx1ZSI6ICJOb25lIn0seyJ0cmFpdF90eXBlIjogIlphcG9yaXpoaWFVcmkiLCAidmFsdWUiOiAiTm9uZSJ9LHsidHJhaXRfdHlwZSI6ICJLb25vdG9wIiwgInZhbHVlIjogIk5vbmUifSx7InRyYWl0X3R5cGUiOiAiQ29zc2FjayIsICJ2YWx1ZSI6ICJOb25lIn1dfQ==')
  //   });
  // });
});