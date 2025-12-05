import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BlockchainBountyModule", (m) => {
  const blockchainBounty = m.contract("BlockchainBounty");  
  return { blockchainBounty };
});
