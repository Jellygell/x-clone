"use client";

import { useState, useEffect } from "react";
import PostForm from "@/components/Tweet/PostForm";
import PostItem from "@/components/Tweet/PostItem";
import PostList from "@/components/Tweet/PostList";
import { db } from "@/firebase/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("foryou");
  const [followingPosts, setFollowingPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFollowingPosts = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const userDocRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const following = userData.following || [];

          if (following.length === 0) {
            setFollowingPosts([]);
            return;
          }

          const postsQuery = query(
            collection(db, "posts"),
            where("authorId", "in", following)
          );
          const querySnapshot = await getDocs(postsQuery);

          const posts = await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
              const postData = docSnap.data();
              const authorId = postData.authorId;

              // Ambil data user (author)
              const authorDocRef = doc(db, "Users", authorId);
              const authorSnap = await getDoc(authorDocRef);
              const authorData = authorSnap.exists() ? authorSnap.data() : {};

              return {
                id: docSnap.id,
                ...postData,
                user: {
                  name: authorData.name || "Unknown",
                  username: authorData.username || "unknown",
                  avatar: authorData.photoURL || "/default-avatar.png",
                },
              };
            })
          );

          // Urutkan post berdasarkan waktu terbaru
          posts.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
          setFollowingPosts(posts);
        }
      } catch (error) {
        console.error("Gagal memuat postingan following:", error);
      } finally {
        setLoading(false);
      }
    };


    if (activeTab === "following") {
      fetchFollowingPosts();
    }
  }, [activeTab, user]);

  return (
    <div className="pl-64 flex min-h-screen">
      <main className="flex-1 border-x border-gray-200 max-w-2xl mx-auto">
        {/* Header with Tabs */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
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

        {/* Post Form */}
        <div className="p-4 border-b">
          <PostForm user={user} onPostSuccess={() => console.log("Post berhasil!")} />
        </div>

        {/* Post List */}
        <div className="flex flex-col gap-6 p-4">
          {activeTab === "foryou" && <PostList />}
          {activeTab === "following" &&
            (loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : followingPosts.length === 0 ? (
              <p className="text-center text-gray-500">Belum mengikuti siapa pun.</p>
            ) : (
              followingPosts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))
            ))}
        </div>
      </main>
    </div>
  );
}
