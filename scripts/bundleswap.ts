import { ethers } from "hardhat";
import ERC20ABI from "../ABI/ERC20ABI.json"
import BundleSwapABI from "../ABI/Bundleswapbi.json";

async function main() {

    const [,,account3] = await ethers.getSigners();

    console.log("Account3: ",account3.address);

    const BundleswapAddress = "0xDAeA149DAFAe63E41665f5960e4a27D24CE1c1B4";
    const USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
    const LINK_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";

    //Bundleswap contract instance  
    const BundleSwap = new ethers.Contract(BundleswapAddress,BundleSwapABI,account3);
    
    //Get pool id
    console.log("Fetching pool id");
    const poolId = await BundleSwap.getPoolId(LINK_ADDRESS,USDC_ADDRESS);
    console.log("Pool id: ",poolId);

    // Get pool balance 
    console.log("Fetching pool balance");
    const poolBalance = await BundleSwap.getPoolBalance(poolId);
    console.log("Pool balance: ",poolBalance);

    // Get amount minimum 
    console.log("Fetching amount min");
    const amountMin = await  BundleSwap.getAmountOutMin(LINK_ADDRESS,USDC_ADDRESS,poolBalance);
    console.log("AmountMin: ",amountMin);

    // Bundleswap
    console.log("Swapping bundle of requests");
    const USDC_AFTER_SWAP = await BundleSwap.bundleswap(LINK_ADDRESS,USDC_ADDRESS,amountMin.value);
    console.log("Bundle swap successfull");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
