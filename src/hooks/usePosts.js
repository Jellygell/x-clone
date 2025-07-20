import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export default function usePosts( userId = null ) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let q = collection(db, 'posts');
        if (userId !== null && userId !== undefined) {
          q = query(q, where('authorId', '==', userId));
        }

        const postSnapshot = await getDocs(q);

        const postData = await Promise.all(
          postSnapshot.docs.map(async (postDoc) => {
            const post = postDoc.data();
            const authorId = post.authorId;

            let userData = {};
            try {
              const userSnap = await getDoc(doc(db, 'Users', authorId));
              if (userSnap.exists()) {
                userData = userSnap.data();
              }
            } catch (err) {
              console.error('Error fetching user data:', err);
            }

            const email = userData?.email || '';
            const name = userData?.name || 'Unknown User';
            const username = email.includes('@') ? email.split('@')[0] : 'unknown';

            return {
              id: postDoc.id,
              ...post,
              user: {
                name,
                username,
                email,
              },
              likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
              commentsCount: Array.isArray(post.comments) ? post.comments.length : 0,
            };
          })
        );

        setPosts(postData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [ userId ]);

  return posts;
}
