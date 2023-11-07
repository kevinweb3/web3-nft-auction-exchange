/**
 * @notice 注意：yarn 安装hardhat和npm 安装hardhat 导包方式和部分功能写法不同
 * @notice 此处是yarn 安装hardhat TS版本, yarn安装直接引入hardhat
 */
import "@nomicfoundation/hardhat-ethers";
import { ethers, artifacts } from "hardhat";
import fs from "fs";

/**
 * @dev 部署合约AuctionFixedPrice、AuctionUnfixedPrice； 保存合约实例json文件
 */
async function main() {
    //Deploy AuctionFixedPrice
    const auctionContractFactory = await ethers.getContractFactory("AuctionFixedPrice");
    const auctionContract = await auctionContractFactory.deploy();
    await auctionContract.waitForDeployment();

    console.log("auction Contract deployed at :", auctionContract.address)
    saveAuctionFiles("AuctionFixedPrice", auctionContract.getAddress())

    //Deploy AuctionUnFixedPrice
    const unauctionContractFactory = await ethers.getContractFactory("AuctionUnfixedPrice");
    const unauctionContract = await unauctionContractFactory.deploy();
    await unauctionContract.waitForDeployment();

    console.log("auction Contract deployed at :", unauctionContract.address)
    saveAuctionFiles("AuctionUnfixedPrice", unauctionContract.getAddress())
}

function saveAuctionFiles(name: string, address: Promise<string>) {
  const contractsDir = __dirname + "/../src/contracts";
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const abi = artifacts.readArtifactSync(name);

  fs.writeFileSync(contractsDir + "/" + name + "json", JSON.stringify(abi, null, 2));
  fs.writeFileSync(contractsDir + "/" + name + "-address", JSON.stringify({addres: address}, undefined, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
