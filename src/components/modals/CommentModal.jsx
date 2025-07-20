'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { db } from '@/firebase/firebase';
import { addDoc, collection, updateDoc, doc, arrayUnion, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function CommentModal({ post, onClose, onCommentPosted }) {
  const [commentText, setCommentText] = useState('');
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleComment = async () => {
    if (!currentUser || !commentText.trim()) return;

    const commentData = {
      postId: post.id,
      authorId: currentUser.uid,
      content: commentText.trim().slice(0, 300),
      images: [],
      createdAt: Timestamp.now(),
    };

    try {
      // 1. Simpan ke collection `comments`
      await addDoc(collection(db, 'comments'), commentData);

      // 2. Tambahkan ke array comments dalam `posts/{postId}`
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        comments: arrayUnion({
          authorId: currentUser.uid,
          content: commentData.content,
          createdAt: commentData.createdAt,
        }),
      });

      onCommentPosted?.();
      onClose();
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center px-4">
      <div className="bg-white p-4 rounded-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          <X size={18} />
        </button>

        {/* Post info */}
        <div className="flex gap-3 mb-4">
          <img src={post.user?.avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold">{post.user?.name || 'Unknown'}</p>
            <p className="text-sm text-gray-500">@{post.user?.username || 'unknown'}</p>
            <p className="mt-2">{post.content}</p>
          </div>
        </div>

        {/* Comment input */}
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value.slice(0, 300))}
          placeholder="Write a comment..."
          rows={3}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-right text-sm text-gray-400">{commentText.length}/300</p>
        <button
          onClick={handleComment}
          disabled={!commentText.trim()}
          className="bg-blue-500 w-full text-white py-2 rounded-md mt-2 hover:bg-blue-600 disabled:opacity-50"
        >
          Post Comment
        </button>
      </div>
    </div>
  );
}
