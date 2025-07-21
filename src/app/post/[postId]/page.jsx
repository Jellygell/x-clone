'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import Sidebar from "@/components/Sidebar";
import { format } from 'date-fns';
import PostDetailContent from '@/components/Tweet/PostDetailContent';
import { ArrowLeft } from 'lucide-react';

export default function PostDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPostWithAuthor = async () => {
      if (!postId) return;

      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();

        const userRef = doc(db, 'Users', postData.authorId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        setPost({
          id: postSnap.id,
          ...postData,
          author: {
            uid: userSnap.id,
            name: userData.name || 'Unknown',
            username: userData.username || 'unknown',
            photoURL: userData.photoURL || null,
          }
        });
      }
    };

    fetchPostWithAuthor();
  }, [postId]);

  return (
    <div className="pl-64 flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen mx-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center gap-3 mb-4">
            <ArrowLeft
              className="cursor-pointer"
              onClick={() => router.back()}
              size={20}
            />
            <h2 className="text-lg font-semibold">Post</h2>
          </div>

          {post ? (
            <>
              <PostDetailContent post={post} />
              <hr className="my-3 border-t border-gray-300" />
              <CommentForm postId={post.id} />
              <hr className="my-3 border-t border-gray-300" />
              <CommentList postId={post.id} />
            </>
          ) : (
            <p>Loading post...</p>
          )}
        </div>
      </main>
    </div>
  );
}
