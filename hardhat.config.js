require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: ['b689f784db9b1f18e0bc27f7d00dc31a4573940a6a07048ead6317d0b1beab5e'],
      chainId: 44787,
   },
  }
};
