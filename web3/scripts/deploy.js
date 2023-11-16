const { ethers, artifacts } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  const address = deployer.address;
  console.log("获取部署合约账户地址：", address);

  const contractFactory = await ethers.getContractFactory("CrowdFunding");
  const deployContract = await contractFactory.deploy();

  await deployContract.waitForDeployment();

  const contractAddress = await deployContract.getAddress();
  console.log("合约部署地址：", contractAddress);

  // 获取合约信息保存传给前端
  // const contractInfos = {
  //   contractName: await deployContract.name(),
  //   contractSymbol: await deployContract.symbol(),
  //   contractDecimals: await deployContract.decimals(),
  //   contractTotalSupply: await deployContract.totalSupply(),
  //   contractBalance: await deployContract.balanceOf(address),
  // };

  // 将合约地址和部署账户信息生成json文件传给前端frontend
  saveFrontendFiles(contractAddress, deployer);
}

function saveFrontendFiles(contractAddress, deployerAccount) {
  const contractsDir = __dirname + "/../../src/constractfiles";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const CrowdFundingArtifact = artifacts.readArtifactSync("CrowdFunding");

  const contractAddressDir = contractsDir + "/contractAddress.json";
  const deployerAccountDir = contractsDir + "/deployerAccount.json";
  const CrowdFundingContractDir = contractsDir + "/CrowdFunding.json";

  fs.writeFileSync(
    contractAddressDir,
    JSON.stringify({ contractAddress: contractAddress }, undefined, 2)
  );

  fs.writeFileSync(
    deployerAccountDir,
    JSON.stringify({ deployer: deployerAccount }, undefined, 2)
  );

  fs.writeFileSync(
    CrowdFundingContractDir,
    JSON.stringify(CrowdFundingArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
