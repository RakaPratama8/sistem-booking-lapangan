import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Cek jadwal dan ajukan booking lapangan olahraga warga.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="bar">
          <div className="mx-auto flex max-w-2xl items-center px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-brand-800 dark:text-brand-300">
              <Image src="/logo.svg" alt="" width={28} height={28} />
              {SITE_NAME}
            </Link>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="muted py-6 text-center text-xs">{SITE_TAGLINE}</footer>
      </body>
    </html>
  );
}
