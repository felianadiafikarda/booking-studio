import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
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
  title: "Lumina Luxe Photo Studio - Booking Jadwal Foto Online & Real-time Slot",
  description: "Platform booking foto studio modern di Yogyakarta. Tersedia Studio Warm Aesthetic & Infinity Cyclorama, garansi bebas double-booking, DP 30%, dan e-ticket otomatis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
