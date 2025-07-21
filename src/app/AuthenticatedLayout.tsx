// app/layout.tsx
'use client';
import type { Metadata } from "next";
import { Noto_Sans } from 'next/font/google';
import "./globals.css";
import { AuthContext, AuthProvider } from '@/context/AuthContext';
import { useContext } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "X Clone",
  description: "X Clone made with NextJS and Firebase.",
};

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
      const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>; // Tambahkan loading UI jika perlu
  }
  return (
     <div className="flex">
      {user && <Sidebar />}
      <main className="flex-1">{children}</main>
      {user && <RightSidebar />}
    </div>
  );
}
