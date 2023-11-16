/**
 * @dev 固定价格拍卖
 */
import { ethers } from "hardhat";

async function main() {
  const [owner, Alice, Bob] = await ethers.getSigners();

  console.log('owner:', owner.address)
  console.log('Alice:', Alice.address)
  console.log('Bob:', Bob.address)


  // Deploy ERC20Token
  const ERC20ContractFactory = await ethers.getContractFactory("ERC20Token");
  const ERC20Contract = await ERC20ContractFactory.deploy('MyToken', 'MT', 1, 100000000);
  await ERC20Contract.waitForDeployment();
  const ERC20Address = ERC20Contract.getAddress();
  console.log('Token address:', ERC20Contract.address);
  await ERC20Contract.transfer(Alice.address, 1000);
  const bal = await ERC20Contract.balanceOf(Alice.address);
  console.log('alice erc20 balance after: ', bal.toNumber());

  // Deploy ERC721Token
  const ERC721ContractFactory = await ethers.getContractFactory("ERC721Token");
  const ERC721Contract = await ERC721ContractFactory.deploy('My721Token', 'MT', 1, 100000000);
  await ERC721Contract.waitForDeployment();
  const ERC721Address = ERC20Contract.getAddress();
  await ERC721Contract.mintWithTokenURI(owner.address, 'www.baidu.com');
  const nftbalBigNumber = await ERC721Contract.balanceOf(owner.address);
  const erc721Id = nftbalBigNumber.toNumber() - 1;
  console.log('owner nft balance', nftbalBigNumber.toNumber());

  // Deploy AuctionFixedPrice
  const auctionContractFactory = await ethers.getContractFactory("AuctionFixedPrice");
  const auctionContract = await auctionContractFactory.deploy();
  await auctionContract.waitForDeployment();
  const auction = auctionContract.getAddress();

  const auctionFixedPriceAlice = auctionContract.connect(Alice)
  console.log('auctionFixedPrice deployed to:', auctionContract.getAddress())
  await ERC721Contract.approve(auction, erc721Id);

  console.log(erc721Id, 'owner approve auction erc721 transfer successfully');

  var timestamp = new Date().getTime();
  const endTime = timestamp + 3600 * 1000;
  console.log('endtime: ', endTime);

  await auctionContract.createTokenAuction(
    ERC721Address,
    erc721Id,
    ERC20Address,
    100,
    endTime
  )
  console.log('owner create token  {} auction successfully:  ', erc721Id);

  const tokenAlice = ERC20Contract.connect(Alice);

  await ERC20Contract.approve(auction, 1000);

  const allow = await ERC20Contract.allowance(Alice.address, auction);
  console.log('alice allowans ', allow.toNumber());

  await auctionContract.purchaseNFTToken(ERC721Address, erc721Id);

  console.log('alice purchase successfully: ');

  const auctionDetail1 = await auctionContract.getTokenAuctionDetails(
    ERC721Address,
    erc721Id
  )

  let erc721IdOwner = await ERC721Contract.ownerOf(erc721Id)

  console.log(auctionDetail1)
  console.log(erc721Id, 'nft owner: ', erc721IdOwner)

}