import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { WalletFooter } from "@/components/wallet/wallet-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXTAUTH_URL ?? "https://tankwallet.dev";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "TANK Wallet — Secure Multi-Chain Wallet",
    template: "%s — TANK Wallet",
  },
  description: "A hot wallet mais segura do mercado. Multi-chain nativa, segurança por padrão, zero confiança em contratos.",
  keywords: ["TANK Wallet", "Web3", "wallet", "multi-chain", "security", "blocklist", "sovereignty"],
  authors: [{ name: "END ART" }],
  alternates: { canonical: baseUrl },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    title: "TANK Wallet — Secure Multi-Chain Wallet",
    description: "A hot wallet mais segura do mercado. Zero trust security.",
    siteName: "TANK Wallet",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "TANK Wallet — ZERO TRUST SECURITY" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TANK Wallet — Secure Multi-Chain Wallet",
    description: "A hot wallet mais segura do mercado.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TANK Wallet",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description: "A hot wallet mais segura do mercado. Zero trust security.",
  url: baseUrl,
  publisher: { "@type": "Organization", name: "END ART", url: baseUrl },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="flex min-h-screen flex-col">
          <div className="flex flex-1 flex-col">
            {children}
          </div>
          <WalletFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
