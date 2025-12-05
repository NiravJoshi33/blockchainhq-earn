"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeSwitch from "./theme-switcher";
import { Separator } from "../ui/separator";
import OpportunitiesDropdown from "./opportunities-dropdown";
import WalletButton from "./wallet-button";
import RoleSwitcher from "./role-switcher";
import DashboardLink from "./dashboard-link";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="px-4 py-4 relative bg-background border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* left side */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex shrink-0">
            <Image
              src="/bhq-logo.png"
              alt="BlockchainHQ"
              width={100}
              height={100}
              className="w-auto h-6 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <OpportunitiesDropdown />
            <DashboardLink />
          </div>
        </div>

        {/* right side - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <RoleSwitcher />
          <Separator orientation="vertical" className="h-6" />
          <ThemeSwitch />
          <WalletButton />
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-md hover:bg-accent"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-lg z-50">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-3" onClick={closeMobileMenu}>
              <OpportunitiesDropdown />
              <DashboardLink />
            </div>

            <Separator className="my-4" />

            {/* Mobile Actions */}
            <div className="space-y-3">
              <RoleSwitcher />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <ThemeSwitch />
              </div>
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
