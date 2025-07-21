'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ImageIcon, SmileIcon } from 'lucide-react';
import { db } from '@/firebase/firebase';
import { addDoc, collection, updateDoc, doc, arrayUnion, Timestamp, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function CommentForm({ postId }) {
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ambil data dari koleksi Users
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ uid: user.uid, ...userDoc.data() });
        } else {
          // fallback jika tidak ada data di Firestore
          setCurrentUser(user);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleComment = async () => {
    if (!currentUser || !commentText.trim()) return;

    const commentData = {
      postId,
      authorId: currentUser.uid,
      content: commentText.trim().slice(0, 300),
      images: [],
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, 'comments'), commentData);

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          authorId: currentUser.uid,
          content: commentData.content,
          createdAt: commentData.createdAt,
        }),
      });

      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  return (
    <div className="flex gap-3 py-4">
      <img
        src={currentUser?.photoURL || '/default-avatar.png'}
        alt="avatar"
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value.slice(0, 300))}
          placeholder="Write a comment..."
          rows={3}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-400 text-right">{commentText.length}/300</p>

        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-4 text-blue-500 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-blue-600"
              type="button"
            >
              <ImageIcon size={20} />
            </button>
            <button type="button" className="hover:text-blue-600">
              <SmileIcon size={20} />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={() => {}}
            />
          </div>

          <button
            onClick={handleComment}
            disabled={!commentText.trim()}
            className="bg-blue-500 text-white py-1 px-4 rounded-full hover:bg-blue-600 disabled:opacity-50"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}
