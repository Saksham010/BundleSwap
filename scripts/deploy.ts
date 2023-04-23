import { ethers } from "hardhat";
const fs = require('fs');

async function main() {

  const [account1] = await ethers.getSigners();

  console.log("Deployer: ",account1.address);

  // Deploy Bundle swap contract
  const BundleSwapFactory = await ethers.getContractFactory("BundleSwap");
  
  const BundleSwap = await BundleSwapFactory.connect(account1).deploy();
  await BundleSwap.deployed();

  console.log("Contract deployed at: ",BundleSwap.address);

  // Write to constant file

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
