'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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
      const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(results);
    };

    fetchComments();
  }, [postId]);

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Komentar</h3>
      {comments.length === 0 ? (
        <p className="text-gray-500">Belum ada komentar.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="border p-3 rounded-md">
              <p className="text-sm text-gray-800">{comment.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                oleh {comment.authorId} • {comment.createdAt?.toDate().toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
