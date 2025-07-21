'use client';

import PostItem from '@/components/Tweet/PostItem';
import { useEffect, useState } from 'react';
import { db, auth } from '@/firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function BookmarksPage() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const q = query(collection(db, 'posts'), where('bookmarkedBy', 'array-contains', user.uid));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookmarkedPosts(posts);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!userId) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 ml-64">
      <h1 className="text-2xl font-bold mb-4">Your Bookmarks</h1>
      {bookmarkedPosts.length === 0 ? (
        <p>No bookmarks yet.</p>
      ) : (
        bookmarkedPosts.map(post => (
          <PostItem key={post.id} post={post} />
        ))
      )}
    </div>
  );
}
