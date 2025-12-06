import Link from "next/link";
import Image from "next/image";
import { Github, Twitter } from "lucide-react";
import { siteData } from "@/lib/data";

const Footer = () => {
  return (
    <footer className="bg-[#0f1e13] dark:bg-[#0f1e13] text-white mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-8">
          {/* Brand Section */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={siteData.logo}
                alt="BlockchainHQ"
                width={150}
                height={150}
                className="brightness-0 invert h-auto w-auto"
              />
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              BlockchainHQ Earn helps you to find the best earning opportunities
              in the blockchain space in one place. You can earn crypto by
              completing tasks, building projects, and more.
            </p>

            <p className="text-sm text-gray-300 leading-relaxed">
              As a sponsor, you can find the best talent for your projects.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/opportunities"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Browse Opportunities
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/bounties"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Bounties
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#opportunity-types"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Opportunity Types
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sponsors */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Sponsors</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            Copyright {new Date().getFullYear()} {siteData.name}
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <Link
              href={siteData.x}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link
              href={siteData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
