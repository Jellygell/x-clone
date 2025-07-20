import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';

// import { Inter } from 'next/font/google'
import { Noto_Sans } from 'next/font/google'

import RightSidebar from "@/components/RightSidebar";
import Sidebar from "@/components/Sidebar";
import LayoutWrapper from "./AuthenticatedLayout";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
//   display: "swap",
// });

// const inter = Inter({ subsets: ['latin'] })

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // bisa disesuaikan
})


export const metadata: Metadata = {
  title: "X Clone",
  description: "X Clone made with NextJS and Firebase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={notoSans.className}
      >
        <AuthProvider>
        <LayoutWrapper>{children}</LayoutWrapper>       
       </AuthProvider>
      </body>
    </html>
  );
}
