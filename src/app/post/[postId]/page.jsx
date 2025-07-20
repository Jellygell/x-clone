'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import PostItem from '@/components/Tweet/PostItem';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import Sidebar from "@/components/Sidebar";


export default function PostDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, 'posts', postId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() });
      }
    };

    if (postId) fetchPost();
  }, [postId]);

  return (
    <div className="pl-64 flex min-h-screen">
      <Sidebar /> 
        <main className="flex-1 min-h-screen mx-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">     
      {post ? (
        <>
          <PostItem post={post} />
          <CommentForm postId={post.id} />
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
