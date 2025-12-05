import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";
import { config } from "dotenv";
config();
 
const BSCTESTNET_RPC_URL = process.env.BSCTESTNET_RPC_URL as string;
const BSCTESTNET_PRIVATE_KEY = process.env.BSCTESTNET_PRIVATE_KEY as string;

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    version: "0.8.28", 
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    bsctestnet: {
      type: "http",
      chainType: "l1",
      url: BSCTESTNET_RPC_URL,
      accounts: [BSCTESTNET_PRIVATE_KEY],
    },
  },
});
