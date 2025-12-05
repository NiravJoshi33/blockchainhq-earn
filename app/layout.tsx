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
import { siteData } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteData.name,
  description: siteData.description,
  creator: "BlockchainHQ",
  publisher: "BlockchainHQ",
  applicationName: siteData.name,
  keywords: ["BlockchainHQ", "Earn", "Web3", "Blockchain", "Opportunities"],
  authors: [{ name: siteData.name, url: siteData.url }],
  metadataBase: new URL(siteData.url),
  alternates: {
    canonical: siteData.url,
  },
  icons: {
    icon: siteData.logo,
  },
  openGraph: {
    images: [siteData.logo],
    type: "website",
    url: siteData.url,
    title: siteData.name,
    description: siteData.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteData.name,
    description: siteData.description,
    images: [siteData.logo],
  },
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
