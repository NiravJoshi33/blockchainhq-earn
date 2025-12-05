import Image from "next/image";
import Link from "next/link";
import ThemeSwitch from "./theme-switcher";
import { Separator } from "../ui/separator";
import OpportunitiesDropdown from "./opportunities-dropdown";
import WalletButton from "./wallet-button";
import RoleSwitcher from "./role-switcher";
import RoleBadge from "./role-badge";

const Navbar = () => {
  return (
    <nav className="px-4 py-4 reltive bg-background border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* left side */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src="/bhq-logo.png"
              alt="BlockchainHQ"
              width={150}
              height={150}
            />
          </Link>

          <Separator orientation="vertical" className="h-8" />

          <OpportunitiesDropdown />

          <Separator orientation="vertical" className="h-8" />

          <RoleBadge />
        </div>

        {/* right side */}
        <div className="flex items-center gap-4">
          <RoleSwitcher />
          <ThemeSwitch />
          <WalletButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
