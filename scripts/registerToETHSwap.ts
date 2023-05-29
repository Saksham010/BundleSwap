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


  const LINK1 = new ethers.Contract(LINK_ADDRESS,ERC20ABI,account1);
  const LINK2 = new ethers.Contract(LINK_ADDRESS,ERC20ABI,account2);


  const BundleSwap1 = new ethers.Contract(BundleswapAddress,BundleSwapABI,account1);
  const BundleSwap2 = new ethers.Contract(BundleswapAddress,BundleSwapABI,account2);

  // // Approve token transfer for LINK for account 1 and account2
    // 
    console.log("Approving");
    const aptx = await  LINK1.approve(BundleswapAddress,ethers.utils.parseEther("450"));
    await aptx.wait();
    const aptx2 = await  LINK2.approve(BundleswapAddress,ethers.utils.parseEther("240"));
    await aptx2.wait();


    console.log("Approved");

  console.log("Registering");
  
  const tx = await BundleSwap1.registerSwapFromTokentoEth(LINK_ADDRESS,parseEther("450"),100);
  await tx.wait();
  const tx2 = await BundleSwap2.registerSwapFromTokentoEth(LINK_ADDRESS,parseEther("240"),100);
  await tx2.wait();

  console.log("Registered");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
