import { useChainId, useSwitchChain } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const TARGET_CHAIN_ID = 97; // BNB Testnet

/**
 * Hook to ensure user is on the correct network (BNB Testnet - Chain ID 97)
 * Automatically switches network if user is on a different chain
 */
export function useNetworkSwitch() {
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (chainId === TARGET_CHAIN_ID) {
      setIsCorrectNetwork(true);
      setHasChecked(true);
    } else {
      setIsCorrectNetwork(false);
      setHasChecked(true);
    }
  }, [chainId]);

  const ensureCorrectNetwork = async (): Promise<boolean> => {
    if (chainId === TARGET_CHAIN_ID) {
      setIsCorrectNetwork(true);
      return true;
    }

    try {
      toast.loading("Switching to BNB Testnet...", { id: "switch-network" });
      
      await switchChain({
        chainId: TARGET_CHAIN_ID,
      });

      toast.success("Switched to BNB Testnet", { id: "switch-network" });
      setIsCorrectNetwork(true);
      return true;
    } catch (error: any) {
      
      // Handle user rejection
      if (error?.code === 4001 || error?.message?.includes("rejected")) {
        toast.error("Network switch was rejected", { id: "switch-network" });
      } else {
        toast.error("Failed to switch network. Please switch to BNB Testnet manually.", {
          id: "switch-network",
        });
      }
      
      setIsCorrectNetwork(false);
      return false;
    }
  };

  return {
    chainId,
    isCorrectNetwork,
    isSwitching,
    hasChecked,
    ensureCorrectNetwork,
    targetChainId: TARGET_CHAIN_ID,
  };
}

