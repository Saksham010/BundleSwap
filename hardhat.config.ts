import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const INFURA_API_KEY = String(process.env.INFURA_KEY);
const PRIVATE_KEY_ONE = String(process.env.PRIVATE_KEY_ONE);
const PRIVATE_KEY_TWO = String(process.env.PRIVATE_KEY_TWO);
const PRIVATE_KEY_THREE = String(process.env.PRIVATE_KEY_THREE);

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks:{
    goerli:{
      url:`https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts:[PRIVATE_KEY_ONE,PRIVATE_KEY_TWO,PRIVATE_KEY_THREE],
      allowUnlimitedContractSize:true

    },
    hardhat:{
      forking:{
        url:`https://goerli.infura.io/v3/${INFURA_API_KEY}`
      }
    }
  }
};

export default config;
