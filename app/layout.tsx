import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "next-themes";
import PrivyProviderWrapper from "@/components/providers/privy-provider";
import { RoleProvider } from "@/contexts/role-context";
import { UserProvider } from "@/contexts/user-context";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChainCred - Cross-Chain Bounty Platform",
  description: "AI-verified bounties with cross-chain credentials on BNB Chain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PrivyProviderWrapper>
            <UserProvider>
              <RoleProvider>
                <Navbar />
                {children}
                <Footer />
                <Toaster />
              </RoleProvider>
            </UserProvider>
          </PrivyProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
