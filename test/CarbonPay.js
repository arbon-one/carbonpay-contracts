// const {
//   loadFixture,
// } = require('@nomicfoundation/hardhat-network-helpers');
// const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
// const { expect } = require('chai');
// const { ContractFunctionVisibility } = require('hardhat/internal/hardhat-network/stack-traces/model');

// describe('CarbonPay', function () {
//   // We define a fixture to reuse the same setup in every test.
//   // We use loadFixture to run this setup once, snapshot that state,
//   // and reset Hardhat Network to that snapshopt in every test.
//   async function deployCarbonPayFixture() {
//     // Contracts are deployed using the first signer/account by default
//     const [owner, otherAccount] = await ethers.getSigners();

//     const CarbonBurner = await ethers.getContractFactory('CarbonBurner');
//     const CarbonNFT = await ethers.getContractFactory('CarbonNFT');
//     const CarbonPay = await ethers.getContractFactory('CarbonPayProcessor');
//     const carbonBurner = await CarbonBurner.deploy();
//     const carbonNFT = await CarbonNFT.deploy();
//     const carbonPay = await CarbonPay.deploy(
//       'UArdians',
//       'UA',
//       100
//     );

//     const UardiansFam = await ethers.getContractFactory('UArdiansFam');
//     const uardiansFam = await UardiansFam.deploy(
//       'ipfs://bafybeibde27e22rnkwu4s3adw5x3w5mu4nx4xgnzycvrlnxfm2bx3qwsey/',
//       'https://bafybeigkotuiobvpkkwffb2rowxvat3mfstc7cxc2ny7e4i5dtzsb4tqgq.ipfs.nftstorage.link/',
//       '',
//       'https://bafybeigkotuiobvpkkwffb2rowxvat3mfstc7cxc2ny7e4i5dtzsb4tqgq.ipfs.nftstorage.link/',
//       uardians.address
//     );

//     return { uardians, uardiansFam, owner, otherAccount };
//   }

//   describe('Deployment', function () {
//     it('Should set the right owner', async function () {
//       const { uardiansFam, owner } = await loadFixture(deployUardiansFixture);
//       expect(await uardiansFam.owner()).to.equal(owner.address);
//     });
//   });

//   describe('Mint', function () {
//     it('User should not have a Frame before at least one UArdian has been minted', async function () {
//       const { uardiansFam, owner } = await loadFixture(deployUardiansFixture);
//       expect(await uardiansFam.hasFrame(owner.address)).to.eq(false);
//     });

//     it('Should have a Frame minted', async function () {
//       const { uardiansFam, owner } = await loadFixture(deployUardiansFixture);
//       await uardiansFam.mint(owner.address, 1);
//       expect(await uardiansFam.hasFrame(owner.address)).to.eq(true);
//     });

//     it('Should have 3 NFTs in the wallet', async function () {
//       const { uardiansFam, owner } = await loadFixture(deployUardiansFixture);
//       await uardiansFam.mint(owner.address, 2);
//       expect((await uardiansFam.getTokensByAddress(owner.address)).length).to.eq(3);
//     });

//     it('Should not mint a Frame if there is already one in the wallet', async function () {
//       const { uardiansFam, owner } = await loadFixture(deployUardiansFixture);
//       await uardiansFam.mint(owner.address, 1);
//       await uardiansFam.mint(owner.address, 1);
//       expect((await uardiansFam.getTokensByAddress(owner.address)).length).to.eq(3);
//     });

//     it('Should return correct totalSupply() for UArdiansFam contract', async function () {
//       const { uardiansFam, owner } = await loadFixture(deployUardiansFixture);
//       await uardiansFam.mint(owner.address, 1);
//       await uardiansFam.mint(owner.address, 1);
//       expect((await uardiansFam.totalSupply())).to.eq(2);
//     });

//     it('Should revert if mint amount is greater than the supply', async function () {
//       const { uardiansFam, owner } = await loadFixture(deployUardiansFixture);
//       await expect(uardiansFam.mint(owner.address, 501)).to.be.revertedWith('Max supply exceeded!');
//     });

//     it('Should revert if 0 mint amount provided', async function () {
//       const { uardiansFam, owner } = await loadFixture(deployUardiansFixture);
//       await expect(uardiansFam.mint(owner.address, 0)).to.be.revertedWith('Invalid mint amount!');
//     });
//   });

//   describe('tokenUri', function () {
//     it('Should return correct metadata for UArdian token', async function () {
//       const { uardiansFam, owner } = await loadFixture(deployUardiansFixture);
//       await uardiansFam.mint(owner.address, 1);
//       expect(await uardiansFam.tokenURI(1)).to.be.equal('ipfs://bafybeibde27e22rnkwu4s3adw5x3w5mu4nx4xgnzycvrlnxfm2bx3qwsey/1.json');
//     });

//     it('Should return correct metadata for a Frame token if no Mykolaiv tokens', async function () {
//       /**
//        * NOTE, there is a small bug in the first UArdians contract that prevents 0 token (the very first one) from being returned by the `walletOfOwner` function.
//        * As a workaround, I ignore the very first token.
//        * As a result, despite 2 mints, I expect only one token in the wallet
//        */
//       const { uardians, uardiansFam, otherAccount, owner} = await loadFixture(deployUardiansFixture);
//       await uardiansFam.mint(owner.address, 1);
//       expect(await uardiansFam.tokenURI(501)).to.eq('data:application/json;base64,eyJuYW1lIjogIlVBcmRpYW5GYW0gIzUwMSIsImltYWdlX2RhdGEiOiAiPHN2ZyB2ZXJzaW9uPScxLjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgdmlld0JveD0nMCAwIDEyODAgMTI4MCcgd2lkdGg9JzEyODAnIGhlaWdodD0nMTI4MCc+PHRpdGxlPlVBcmRpYW5zRmFtPC90aXRsZT48ZGVmcz48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J2tvemFrJyBocmVmPSdodHRwczovL2JhZnliZWlna290dWlvYnZwa2t3ZmZiMnJvd3h2YXQzbWZzdGM3Y3hjMm55N2U0aTVkdHpzYjR0cWdxLmlwZnMubmZ0c3RvcmFnZS5saW5rLzUucG5nJz48L2ltYWdlPjxpbWFnZSB3aWR0aD0nMzAwMCcgaGVpZ2h0PSc0MDAwJyBpZD0na296YWsnIGhyZWY9J2h0dHBzOi8vYmFmeWJlaWdrb3R1aW9idnBra3dmZmIycm93eHZhdDNtZnN0YzdjeGMybnk3ZTRpNWR0enNiNHRxZ3EuaXBmcy5uZnRzdG9yYWdlLmxpbmsvMy5wbmcnPjwvaW1hZ2U+PGltYWdlIHdpZHRoPSczMDAwJyBoZWlnaHQ9JzQwMDAnIGlkPSdrb25vdG9wJyBocmVmPSdodHRwczovL2JhZnliZWlna290dWlvYnZwa2t3ZmZiMnJvd3h2YXQzbWZzdGM3Y3hjMm55N2U0aTVkdHpzYjR0cWdxLmlwZnMubmZ0c3RvcmFnZS5saW5rLzQucG5nJz48L2ltYWdlPjxpbWFnZSB3aWR0aD0nMzAwMCcgaGVpZ2h0PSc0MDAwJyBpZD0na2hhcmtpdicgaHJlZj0naHR0cHM6Ly9iYWZ5YmVpZ2tvdHVpb2J2cGtrd2ZmYjJyb3d4dmF0M21mc3RjN2N4YzJueTdlNGk1ZHR6c2I0dHFncS5pcGZzLm5mdHN0b3JhZ2UubGluay8xLnBuZyc+PC9pbWFnZT48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J29kZXNzYScgaHJlZj0naHR0cHM6Ly9iYWZ5YmVpZ2tvdHVpb2J2cGtrd2ZmYjJyb3d4dmF0M21mc3RjN2N4YzJueTdlNGk1ZHR6c2I0dHFncS5pcGZzLm5mdHN0b3JhZ2UubGluay8yLnBuZyc+PC9pbWFnZT48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J215a29sYWl2JyBocmVmPScnPjwvaW1hZ2U+PC9kZWZzPjxzdHlsZT48L3N0eWxlPjx1c2UgaHJlZj0nI2tvemFrJyB0cmFuc2Zvcm09J21hdHJpeCguMjc5LDAsMCwuMjg5LDIzOSwxMDgpJy8+PHVzZSBocmVmPScjemFwb3JpemhpYScgdHJhbnNmb3JtPSdtYXRyaXgoLjQ2MiwwLDAsLjQ2MiwtMTk5LDUzKScvPjx1c2UgaHJlZj0nI2tvbm90b3AnIHRyYW5zZm9ybT0nbWF0cml4KC40MTEsMCwwLC4zODIsMjc0LDE3MyknLz48dXNlIGhyZWY9JyNraGFya2l2JyB0cmFuc2Zvcm09J21hdHJpeCguMjQ4LDAsMCwuMjUxLC0xMTQsNDg3KScvPjx1c2UgaHJlZj0nI29kZXNzYScgdHJhbnNmb3JtPSdtYXRyaXgoLjMwMiwwLDAsLjI5NSw2NjgsMjYwKScvPiIsImF0dHJpYnV0ZXMiOiBbeyJ0cmFpdF90eXBlIjogIk15a29sYWl2IiwgInZhbHVlIjogIk5vbmUifSx7InRyYWl0X3R5cGUiOiAiS2hhcmtpdiIsICJ2YWx1ZSI6IDF9LHsidHJhaXRfdHlwZSI6ICJPZGVzc2EiLCAidmFsdWUiOiAiTm9uZSJ9LHsidHJhaXRfdHlwZSI6ICJaYXBvcml6aGlhVXJpIiwgInZhbHVlIjogIk5vbmUifSx7InRyYWl0X3R5cGUiOiAiS29ub3RvcCIsICJ2YWx1ZSI6ICJOb25lIn0seyJ0cmFpdF90eXBlIjogIkNvc3NhY2siLCAidmFsdWUiOiAiTm9uZSJ9XX0=')
//     });

//     it('Should return correct metadata for a Frame token if there is a Mykolaiv token', async function () {
//       /**
//        * NOTE, there is a small bug in the first UArdians contract that prevents 0 token (the very first one) from being returned by the `walletOfOwner` function.
//        * As a workaround, I ignore the very first token.
//        * As a result, despite 2 mints, I expect only one token in the wallet
//        */
//       const { uardians, uardiansFam, otherAccount, owner} = await loadFixture(deployUardiansFixture);
//       await uardians.setPaused(false);
//       await uardiansFam.mint(owner.address, 1);
//       await uardians.connect(otherAccount).mint(1, {value: ethers.utils.parseEther('0.08')});
//       await uardians.mint(1, {value: ethers.utils.parseEther('0.08')});
//       expect(await uardiansFam.tokenURI(501)).to.eq('data:application/json;base64,eyJuYW1lIjogIlVBcmRpYW5GYW0gIzUwMSIsImltYWdlX2RhdGEiOiAiPHN2ZyB2ZXJzaW9uPScxLjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgdmlld0JveD0nMCAwIDEyODAgMTI4MCcgd2lkdGg9JzEyODAnIGhlaWdodD0nMTI4MCc+PHRpdGxlPlVBcmRpYW5zRmFtPC90aXRsZT48ZGVmcz48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J2tvemFrJyBocmVmPSdodHRwczovL2JhZnliZWlna290dWlvYnZwa2t3ZmZiMnJvd3h2YXQzbWZzdGM3Y3hjMm55N2U0aTVkdHpzYjR0cWdxLmlwZnMubmZ0c3RvcmFnZS5saW5rLzUucG5nJz48L2ltYWdlPjxpbWFnZSB3aWR0aD0nMzAwMCcgaGVpZ2h0PSc0MDAwJyBpZD0na296YWsnIGhyZWY9J2h0dHBzOi8vYmFmeWJlaWdrb3R1aW9idnBra3dmZmIycm93eHZhdDNtZnN0YzdjeGMybnk3ZTRpNWR0enNiNHRxZ3EuaXBmcy5uZnRzdG9yYWdlLmxpbmsvMy5wbmcnPjwvaW1hZ2U+PGltYWdlIHdpZHRoPSczMDAwJyBoZWlnaHQ9JzQwMDAnIGlkPSdrb25vdG9wJyBocmVmPSdodHRwczovL2JhZnliZWlna290dWlvYnZwa2t3ZmZiMnJvd3h2YXQzbWZzdGM3Y3hjMm55N2U0aTVkdHpzYjR0cWdxLmlwZnMubmZ0c3RvcmFnZS5saW5rLzQucG5nJz48L2ltYWdlPjxpbWFnZSB3aWR0aD0nMzAwMCcgaGVpZ2h0PSc0MDAwJyBpZD0na2hhcmtpdicgaHJlZj0naHR0cHM6Ly9iYWZ5YmVpZ2tvdHVpb2J2cGtrd2ZmYjJyb3d4dmF0M21mc3RjN2N4YzJueTdlNGk1ZHR6c2I0dHFncS5pcGZzLm5mdHN0b3JhZ2UubGluay8xLnBuZyc+PC9pbWFnZT48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J29kZXNzYScgaHJlZj0naHR0cHM6Ly9iYWZ5YmVpZ2tvdHVpb2J2cGtrd2ZmYjJyb3d4dmF0M21mc3RjN2N4YzJueTdlNGk1ZHR6c2I0dHFncS5pcGZzLm5mdHN0b3JhZ2UubGluay8yLnBuZyc+PC9pbWFnZT48aW1hZ2Ugd2lkdGg9JzMwMDAnIGhlaWdodD0nNDAwMCcgaWQ9J215a29sYWl2JyBocmVmPScxLnBuZyc+PC9pbWFnZT48L2RlZnM+PHN0eWxlPjwvc3R5bGU+PHVzZSBocmVmPScja296YWsnIHRyYW5zZm9ybT0nbWF0cml4KC4yNzksMCwwLC4yODksMjM5LDEwOCknLz48dXNlIGhyZWY9JyN6YXBvcml6aGlhJyB0cmFuc2Zvcm09J21hdHJpeCguNDYyLDAsMCwuNDYyLC0xOTksNTMpJy8+PHVzZSBocmVmPScja29ub3RvcCcgdHJhbnNmb3JtPSdtYXRyaXgoLjQxMSwwLDAsLjM4MiwyNzQsMTczKScvPjx1c2UgaHJlZj0nI2toYXJraXYnIHRyYW5zZm9ybT0nbWF0cml4KC4yNDgsMCwwLC4yNTEsLTExNCw0ODcpJy8+PHVzZSBocmVmPScjb2Rlc3NhJyB0cmFuc2Zvcm09J21hdHJpeCguMzAyLDAsMCwuMjk1LDY2OCwyNjApJy8+PHVzZSBocmVmPScjbXlrb2xhaXYnIHRyYW5zZm9ybT0nbWF0cml4KC4yODYsMCwwLC4yOTEsMjIxLDQ5MyknLz4iLCJhdHRyaWJ1dGVzIjogW3sidHJhaXRfdHlwZSI6ICJNeWtvbGFpdiIsICJ2YWx1ZSI6IDF9LHsidHJhaXRfdHlwZSI6ICJLaGFya2l2IiwgInZhbHVlIjogMX0seyJ0cmFpdF90eXBlIjogIk9kZXNzYSIsICJ2YWx1ZSI6ICJOb25lIn0seyJ0cmFpdF90eXBlIjogIlphcG9yaXpoaWFVcmkiLCAidmFsdWUiOiAiTm9uZSJ9LHsidHJhaXRfdHlwZSI6ICJLb25vdG9wIiwgInZhbHVlIjogIk5vbmUifSx7InRyYWl0X3R5cGUiOiAiQ29zc2FjayIsICJ2YWx1ZSI6ICJOb25lIn1dfQ==')
//     });
//   });
// });