require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 20, // 20 gwei baseline
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "", // Optional mapping for real USD
  }
};
