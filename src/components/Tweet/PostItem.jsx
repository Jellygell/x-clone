'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Heart } from 'lucide-react';
import { db } from '@/firebase/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import CommentModal from '../modals/CommentModal';
import { useRouter } from 'next/navigation';

export default function PostItem({ post }) {
  if (!post) return null;

  const user = post.user || { name: 'Unknown', username: 'unknown', avatar: '/default-avatar.png' };
  // const comments = post.comments ?? 0;
  const content = post.content ?? '';
  const [likes, setLikes] = useState(post.likes ?? []);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const router = useRouter();

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const isLiked = currentUser ? likes.includes(currentUser.uid) : false;

  const handleLike = async () => {
    if (!currentUser) return;

    const postRef = doc(db, 'posts', post.id);
    const userId = currentUser.uid;

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
        });
        setLikes((prev) => prev.filter((id) => id !== userId));
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
        });
        setLikes((prev) => [...prev, userId]);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleCommentPosted = () => {
    setCommentsCount((prev) => prev + 1);
  };

  return (
    <>
    {/* <div
      onClick={() => router.push(`/post/${post.id}`)}
      className="cursor-pointer border-b py-4 flex gap-4 hover:bg-gray-50"
    > */}
      <div className="border-b py-4 flex gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold">{user.name}</p>
            <p className="text-gray-500 text-sm">@{user.username}</p>
          </div>
          <p className="my-2">{content}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div
                className="flex items-center gap-1 hover:text-blue-500 cursor-pointer"
                onClick={() => setIsCommentModalOpen(true)}
              >
                <MessageCircle size={18} />
                <span>{commentsCount}</span>
              </div>
            <div
              className={`flex items-center gap-1 cursor-pointer ${
                isLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
              onClick={handleLike}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likes.length}</span>
            </div>
          </div>
        </div>
      </div>
    {/* </div> */}
    {isCommentModalOpen && (
      <CommentModal
        post={post}
        onClose={() => setIsCommentModalOpen(false)}
        onCommentPosted={handleCommentPosted}
      />
    )}
    </>
  );
}
