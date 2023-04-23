import { ethers } from "hardhat";
import ERC20ABI from "../ABI/ERC20ABI.json"
import BundleSwapABI from "../ABI/Bundleswapbi.json";

async function main() {

  const [account1,account2,account3] = await ethers.getSigners();

  console.log("Account1: ",account1.address);
  console.log("Account2 :", account2.address);

  const BundleswapAddress = "0xc317A75Ab44D8f4459e36BFCb817068d5dB9a786";

  const USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
  const LINK_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";

  const LINK1 = new ethers.Contract(LINK_ADDRESS,ERC20ABI,account1);
  const LINK2 = new ethers.Contract(LINK_ADDRESS,ERC20ABI,account2);

  const BundleSwap1 = new ethers.Contract(BundleswapAddress,BundleSwapABI,account1);
  const BundleSwap2 = new ethers.Contract(BundleswapAddress,BundleSwapABI,account2);

  // // Approve token transfer for USDC and link for account 1 and account2
// 
  console.log("Approving");
  await  LINK1.approve(BundleswapAddress,ethers.utils.parseEther("12"));
  await  LINK2.approve(BundleswapAddress,ethers.utils.parseEther("12"));

  console.log("Approved");

  // // Swap from Chainlink to USDC => 12 chainlink --> 0 usdc for 5mins(300)  

  console.log("Registering");
  
  await BundleSwap1.registerSwap(LINK_ADDRESS,USDC_ADDRESS,ethers.utils.parseEther("12"),ethers.utils.parseEther("0"),300);
  await BundleSwap2.registerSwap(LINK_ADDRESS,USDC_ADDRESS,ethers.utils.parseEther("4"),0,300);

  console.log("Registered");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
