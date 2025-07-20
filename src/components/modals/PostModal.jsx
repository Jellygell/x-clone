'use client';
import { X } from 'lucide-react';
import PostForm from '../Tweet/PostForm';

export default function PostModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Create Post</h2>
        <PostForm onPostSuccess={onClose} />
      </div>
    </div>
  );
}
