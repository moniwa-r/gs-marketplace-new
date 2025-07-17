import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import layoutStyles from './layout.module.css';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const roboto_mono = Roboto_Mono({ subsets: ["latin"], variable: '--font-roboto-mono' });

export const metadata: Metadata = {
  title: "3DGSマーケットプレイス",
  description: "3Dガウススプラッティングデータのマーケットプレイスです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${roboto_mono.variable}`}>
      <body className={layoutStyles.body}>
        <header className={layoutStyles.header}>
          <Link href="/" className={layoutStyles.headerTitle}>
            3DGSマーケットプレイス
          </Link>
          <nav className={layoutStyles.nav}>
            <Link href="/sell" className={layoutStyles.navLink}>
              出品
            </Link>
            <Link href="/profile" className={layoutStyles.navLink}>
              プロフィール
            </Link>
            <Link href="/cart" className={layoutStyles.navLink}>
              🛒 カート
            </Link>
            <AuthButton />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}