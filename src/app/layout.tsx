import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";
import "./globals.css";

// Variable font; the width axis gives the semi-condensed look used for times and titles.
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Cek jadwal dan ajukan booking lapangan olahraga warga.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-lg items-center px-4 py-2">
            <Link href="/" className="flex min-h-10 items-center gap-2 font-semibold text-ink">
              <Image src="/logo.svg" alt="" width={24} height={24} />
              {SITE_NAME}
            </Link>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="muted mx-auto w-full max-w-lg px-4 py-6 text-sm">{SITE_TAGLINE}</footer>
      </body>
    </html>
  );
}
