import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BlockchainBounty", (m) => {
  const blockchainBounty = m.contract("BlockchainBounty");

  return { blockchainBounty };
});