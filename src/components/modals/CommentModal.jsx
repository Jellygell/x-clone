'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import CommentForm from '@/components/CommentForm'; // pastikan path ini sesuai

export default function CommentModal({ post, onClose, onCommentPosted }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    setCurrentUser(auth.currentUser);
  }, []);

  const user = post?.user;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center px-4">
      <div className="bg-white p-4 rounded-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          <X size={18} />
        </button>

        {/* Post Info */}
        <div className="flex gap-3 mb-2">
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex gap-2 items-center">
              <p className="font-bold">{user?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-500">@{user?.username || 'unknown'}</p>
            </div>
            <p className="mt-1 whitespace-pre-line">{post?.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              Replying to <span className="text-blue-500">@{user?.username || 'unknown'}</span>
            </p>
          </div>
        </div>

        {/* Comment Input (Form) */}
        <CommentForm postId={post.id} />
      </div>
    </div>
  );
}
