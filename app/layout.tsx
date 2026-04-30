import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/app/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MakerBox",
  description: "MakerBox: co-creación e innovación",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(107,63,160,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(58,176,255,0.12),_transparent_28%),linear-gradient(135deg,_#ffffff,_#f8f5ff)] text-slate-900 antialiased`}
      >
        <main className="flex-grow">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
