'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export default function CommentForm({ postId }) {
  const [content, setContent] = useState('');
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !content.trim()) return;

    const comment = {
      postId,
      authorId: currentUser.uid,
      content: content.slice(0, 300),
      images: [],
      createdAt: Timestamp.now(),
    };

    try {
      // 1. Tambah ke `comments`
      await addDoc(collection(db, 'comments'), comment);
      // 2. Tambah ke `posts` -> comments array
      await updateDoc(doc(db, 'posts', postId), {
        comments: arrayUnion({
          authorId: currentUser.uid,
          content: comment.content,
          createdAt: comment.createdAt,
        }),
      });
      setContent('');
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={300}
        className="w-full border rounded-md p-2"
        placeholder="Tulis komentar..."
      />
      <div className="text-right text-sm text-gray-500">{content.length}/300</div>
      <button
        type="submit"
        className="bg-blue-500 text-white mt-2 px-4 py-2 rounded hover:bg-blue-600"
        disabled={!content.trim()}
      >
        Kirim Komentar
      </button>
    </form>
  );
}
