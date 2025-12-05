import Image from "next/image";
import Link from "next/link";
import ThemeSwitch from "./theme-switcher";
import { Separator } from "../ui/separator";
import OpportunitiesDropdown from "./opportunities-dropdown";
import WalletButton from "./wallet-button";
import RoleSwitcher from "./role-switcher";
import DashboardLink from "./dashboard-link";

const Navbar = () => {
  return (
    <nav className="px-4 py-4 relative bg-background border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* left side */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/bhq-logo.png"
              alt="BlockchainHQ"
              width={200}
              height={150}
            />
          </Link>

          <div className="flex items-center gap-4">
            <OpportunitiesDropdown />
            <DashboardLink />
          </div>
        </div>

        {/* right side */}
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <Separator orientation="vertical" className="h-6" />
          <ThemeSwitch />
          <WalletButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
