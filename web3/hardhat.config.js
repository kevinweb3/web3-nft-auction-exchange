/**
 * @notice 注意：yarn 安装hardhat和npm 安装hardhat 导包方式和部分功能写法不同
 * @notice 此处是npm 安装hardhat JS版本, npm安装直接引入hardhat-toolbox即可
 */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "goerli",
  networks: {
    hardhat: {
      // forking: {
      //   url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
      // }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url:
        "https://eth-sepolia.g.alchemy.com/v2/" +
        process.env.REACT_APP_ALCHEMY_Sepolia_API_KEY,
      accounts: [PRIVATE_KEY],
    },
    goerli: {
      url:
        "https://eth-goerli.g.alchemy.com/v2/" +
        process.env.REACT_APP_ALCHEMY_Goerli_API_KEY,
      accounts: [PRIVATE_KEY],
      // url:
      //   "https://goerli.infura.io/v3/" + process.env.REACT_APP_INFURA_API_KEY,
      // accounts: [PRIVATE_KEY],
    },
    mainnet: {
      url:
        "https://mainnet.infura.io/v3/" + process.env.REACT_APP_INFURA_API_KEY,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: process.env.REACT_APP_ETHERSCAN_API,
  },
  mocha: {
    timeout: 40000,
  },
};
