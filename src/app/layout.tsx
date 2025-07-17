import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import layoutStyles from './layout.module.css';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const roboto_mono = Roboto_Mono({ subsets: ["latin"], variable: '--font-roboto-mono' });

export const metadata: Metadata = {
  title: "3DGS Marketplace",
  description: "A marketplace for 3D Gaussian Splatting data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`}>
      <body className={layoutStyles.body}>
        <header className={layoutStyles.header}>
          <Link href="/" className={layoutStyles.headerTitle}>
            3DGS Marketplace
          </Link>
          <nav className={layoutStyles.nav}>
            <Link href="/sell" className={layoutStyles.navLink}>
              Sell
            </Link>
            <Link href="/profile" className={layoutStyles.navLink}>
              Profile
            </Link>
            <Link href="/cart" className={layoutStyles.navLink}> {/* カートへのリンクを追加 */}
              🛒 Cart
            </Link>
            <AuthButton />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
