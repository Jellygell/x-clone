"use client";

import { useState } from "react";
import PostForm from "@/components/Tweet/PostForm";
import PostList from "@/components/Tweet/PostList";
import RightSidebar from "@/components/RightSidebar";
import Sidebar from "@/components/Sidebar";
import useAuth from "@/hooks/useAuth"; // ✅ Tambahkan ini

export default function Dashboard() {
  const { user } = useAuth(); // ✅ Ambil user yang login
  const [activeTab, setActiveTab] = useState("foryou");

  return (
    <div className="pl-64 flex min-h-screen">
      {/* <Sidebar /> */}

      <main className="flex-1 border-x border-gray-200 min-h-screen max-w-2xl mx-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold">Home</h1>

          <div className="flex mt-4">
            <button
              onClick={() => setActiveTab("foryou")}
              className={`flex-1 text-center py-2 font-medium ${
                activeTab === "foryou"
                  ? "border-b-2 border-blue-500 text-black"
                  : "text-gray-500"
              }`}
            >
              For You
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 text-center py-2 font-medium ${
                activeTab === "following"
                  ? "border-b-2 border-blue-500 text-black"
                  : "text-gray-500"
              }`}
            >
              Following
            </button>
          </div>
        </div>

        <div className="p-4 border-b">
          {/* ✅ Kirim user ke PostForm (opsional) */}
          <PostForm user={user} onPostSuccess={() => console.log("Post berhasil!")} />
        </div>

        <div className="flex flex-col gap-6 p-4">
          <PostList />
        </div>

      </main>

      {/* <RightSidebar /> */}
    </div>
  );
}
