"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bsc, bscTestnet, opBNB, opBNBTestnet } from "wagmi/chains";
import { http } from "wagmi";
import { createConfig } from "wagmi";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet, opBNB, opBNBTestnet],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [opBNB.id]: http(),
    [opBNBTestnet.id]: http(),
  },
});

function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: theme === "dark" ? "dark" : "light",
          accentColor: "#22c55e",
          logo: "/bhq-logo.png",
        },
        loginMethods: ["wallet", "email", "google"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: bscTestnet,
        supportedChains: [bsc, bscTestnet, opBNB, opBNBTestnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyWrapper>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </PrivyWrapper>
    </QueryClientProvider>
  );
}
