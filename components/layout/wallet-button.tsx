"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "../ui/button";
import { WalletIcon, LogOutIcon, CopyIcon, CheckIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function WalletButton() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [copied, setCopied] = useState(false);

  const wallet = wallets[0];
  const address = wallet?.address;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!authenticated) {
    return (
      <Button
        onClick={login}
        className="bg-brand hover:bg-brand/90 text-white font-medium"
      >
        <WalletIcon className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-medium">
          <WalletIcon className="w-4 h-4 mr-2" />
          {address ? formatAddress(address) : "Connected"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {address && (
          <DropdownMenuItem onClick={copyAddress}>
            {copied ? (
              <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <CopyIcon className="w-4 h-4 mr-2" />
            )}
            {copied ? "Copied!" : "Copy Address"}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => (window.location.href = "/profile")}>
          View Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => (window.location.href = "/bounties")}>
          My Bounties
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOutIcon className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
