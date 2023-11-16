import { ethers } from "hardhat";

async function main() {
  const randomAddress = "0xbb50a47649524fffbd18827316aa8a3e428813aa";
  console.log("catBlindbox begin to depploy!")
  const CatBlindboxFactory = await ethers.getContractFactory("CatBlindbox");
  const catBlindbox = await CatBlindboxFactory.deploy(randomAddress);
  await catBlindbox.waitForDeployment();

  console.log("catBlindbox Contract deployed at :", catBlindbox.getAddress())
  
  const transactiontReceipt = await catBlindbox.requestNewBlindboxCat(77, "The Cat Blindbox - 01");
  // const tx = await transactiontReceipt.wait();
    const { events } = await transactiontReceipt.wait();
  
  const args = events.find(({ event }) => event === 'ResultOfNewBlindboxCat').args
  
  console.log(args);
  console.log("get request id: ");
  
  console.log(args.requestId);
  function sleep (time: number | undefined) {
      return new Promise((resolve) => setTimeout(resolve, time));
  }
  
  await sleep(8000);
  
  const transactiontReceipt1 =  await catBlindbox.generateBlindBoxCat(args.requestId);
  const tx1 = await transactiontReceipt1.wait();
  console.log("create the cat tx :", tx1.status);
  
  const len = await catBlindbox.getLength();
  console.log("len:", len);
  
  const cat = await catBlindbox.generatedCats(0);
  console.log("cat: " , cat);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });