import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Booking Lapangan",
  description: "Cek jadwal dan ajukan booking lapangan olahraga warga.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-green-800">
              <span aria-hidden className="text-xl">⚽</span>
              Booking Lapangan
            </Link>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="py-6 text-center text-xs text-zinc-500">Lapangan olahraga warga</footer>
      </body>
    </html>
  );
}
