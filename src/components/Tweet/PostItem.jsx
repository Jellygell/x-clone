'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Heart, Bookmark } from 'lucide-react';
import { db } from '@/firebase/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import CommentModal from '../modals/CommentModal';
import Link from 'next/link';

export default function PostItem({ post }) {
  const router = useRouter();
  const [likes, setLikes] = useState(post.likes ?? []);
  const [bookmarks, setBookmarks] = useState(post.bookmarkedBy ?? []);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const isLiked = currentUser ? likes.includes(currentUser.uid) : false;
  const isBookmarked = currentUser ? bookmarks.includes(currentUser.uid) : false;

  const [user, setPostUser] = useState({
    name: 'Unknown',
    username: 'unknown',
    avatar: '/default-avatar.png',
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!post.authorId) return;

      try {
        const userRef = doc(db, 'Users', post.authorId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setPostUser({
            uid: post.authorId,
            name: data.name || 'Unknown',
            username: data.username || 'unknown',
            avatar: data.photoURL || '/default-avatar.png',
          });
        }
      } catch (err) {
        console.error('Gagal mengambil data user untuk post:', err);
      }
    };

    fetchUser();
  }, [post.authorId]);


  const content = post.content ?? '';

  const handleLike = async () => {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', post.id);
    const userId = currentUser.uid;

    try {
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(userId) });
        setLikes((prev) => prev.filter((id) => id !== userId));
      } else {
        await updateDoc(postRef, { likes: arrayUnion(userId) });
        setLikes((prev) => [...prev, userId]);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', post.id);
    const userId = currentUser.uid;

    try {
      if (isBookmarked) {
        await updateDoc(postRef, { bookmarkedBy: arrayRemove(userId) });
        setBookmarks((prev) => prev.filter((id) => id !== userId));
      } else {
        await updateDoc(postRef, { bookmarkedBy: arrayUnion(userId) });
        setBookmarks((prev) => [...prev, userId]);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleCommentPosted = () => {
    setCommentsCount((prev) => prev + 1);
  };

  return (
    <>
      <div
        onClick={() => router.push(`/post/${post.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`border-b border-gray-300 py-5 flex gap-4 relative cursor-pointer transition-colors duration-200 ${
          isHovered ? 'bg-neutral-100' : ''
        }`}
      >
        <Link
          href={`/user/${user.uid}`}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
          <Link
            href={`/user/${user.uid}`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold hover:underline">{user.name}</p>
          </Link>
          <Link
            href={`/user/${user.uid}`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-500 text-sm hover:underline">@{user.username}</p>
          </Link>
          </div>

          <p className="my-2 mb-3">
            {content}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div
              className="flex items-center gap-1 hover:text-blue-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsCommentModalOpen(true);
              }}
            >
              <MessageCircle size={18} />
              <span>{commentsCount}</span>
            </div>

            <div
              className={`flex items-center gap-1 cursor-pointer ${
                isLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likes.length}</span>
            </div>
          </div>
        </div>

        {/* Bookmark Icon */}
        <div
          className={`absolute right-4 top-4 cursor-pointer ${
            isBookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark();
          }}
        >
          <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
        </div>
      </div>

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
