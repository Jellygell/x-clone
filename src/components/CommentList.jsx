'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export default function CommentList({ postId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);

      // Ambil komentar dan ambil data user berdasarkan authorId
      const commentsWithUsers = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const commentData = docSnap.data();

          // Ambil data user dari koleksi 'users'
          let userData = {};
          try {
            const userRef = doc(db, 'Users', commentData.authorId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              userData = userSnap.data();
            }
          } catch (err) {
            console.error('Gagal mengambil user untuk komentar:', err);
          }

          return {
            id: docSnap.id,
            ...commentData,
            user: {
              name: userData.name || 'Anonymous',
              username: userData.username || 'unknown',
              photoURL: userData.photoURL || '/default-avatar.png',
            },
          };
        })
      );

      setComments(commentsWithUsers);
    };

    fetchComments();
  }, [postId]);


  return (
    <div className="mt-6 space-y-6">
      {comments.length === 0 ? (
        <p className="text-gray-500">Belum ada komentar.</p>
      ) : (
        comments.map((comment) => {
          const createdAt = comment.createdAt?.toDate();
          const timeString = createdAt
            ? createdAt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            : '';
          const dateString = createdAt
            ? createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '';

          const avatar = comment.user?.photoURL || '/default-avatar.png';
          const name = comment.user?.name || 'Anonymous';
          const username = comment.user?.username || 'unknown';

          return (
            <div key={comment.id} className="flex gap-3 border-b border-gray-300 pb-5">
              <img
                src={avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-gray-500">@{username}</p>
                </div>
                <p className="text-gray-800 mt-1 whitespace-pre-line">{comment.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {timeString} · {dateString}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
