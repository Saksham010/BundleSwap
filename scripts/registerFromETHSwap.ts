import { ethers } from "hardhat";
import ERC20ABI from "../ABI/ERC20ABI.json"
import BundleSwapABI from "../ABI/Bundleswapbi.json";
import { parseEther } from "ethers/lib/utils";

async function main() {

  const [account1,account2,account3] = await ethers.getSigners();

  console.log("Account1: ",account1.address);
  console.log("Account2 :", account2.address);
  
  const BundleswapAddress = "0x95f62D72dDB6c82105F2832Fb2bE6CF633416B19";

  const LINK_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";


  const BundleSwap1 = new ethers.Contract(BundleswapAddress,BundleSwapABI,account1);
  const BundleSwap2 = new ethers.Contract(BundleswapAddress,BundleSwapABI,account2);


  console.log("Registering");
  
  const tx = await BundleSwap1.registerSwapFromETHToToken(LINK_ADDRESS,parseEther("0"),100,{value:parseEther("0.2")});
  await tx.wait();
  const tx2 = await BundleSwap2.registerSwapFromETHToToken(LINK_ADDRESS,parseEther("0"),100,{value:parseEther("0.1")});
  await tx2.wait();

  console.log("Registered");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
