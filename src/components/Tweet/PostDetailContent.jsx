'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bookmark, Heart, MessageCircle } from 'lucide-react';
import {
  getAuth,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export default function PostDetailContent({ post }) {
  const [likes, setLikes] = useState(post.likes || []);
  const [bookmarkedBy, setBookmarkedBy] = useState(post.bookmarkedBy || []);
  const [currentUser, setCurrentUser] = useState(null);
  const [following, setFollowing] = useState([]);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const currentUserDoc = await getDoc(doc(db, 'Users', user.uid));
        const currentData = currentUserDoc.data();
        setFollowing(currentData?.following || []);
      }
    });

    return () => unsubscribe();
  }, []);

  const uid = currentUser?.uid;
  const hasLiked = uid && likes.includes(uid);
  const hasBookmarked = uid && bookmarkedBy.includes(uid);
  const isFollowing = uid && following.includes(post.author?.uid);

  const formattedDate = post.createdAt?.toDate
    ? format(post.createdAt.toDate(), 'h:mm a · MMM dd, yyyy')
    : 'Unknown date';

  const handleLike = async () => {
    if (!uid) return alert('You must be logged in to like posts.');
    const postRef = doc(db, 'posts', post.id);

    try {
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid),
      });
      setLikes((prev) =>
        hasLiked ? prev.filter((id) => id !== uid) : [...prev, uid]
      );
    } catch (err) {
      console.error('Failed to update like:', err);
    }
  };

  const handleBookmark = async () => {
    if (!uid) return alert('You must be logged in to bookmark posts.');
    const postRef = doc(db, 'posts', post.id);

    try {
      await updateDoc(postRef, {
        bookmarkedBy: hasBookmarked
          ? arrayRemove(uid)
          : arrayUnion(uid),
      });
      setBookmarkedBy((prev) =>
        hasBookmarked ? prev.filter((id) => id !== uid) : [...prev, uid]
      );
    } catch (err) {
      console.error('Failed to update bookmark:', err);
    }
  };

  const handleFollow = async () => {
    if (!uid || !post.author?.uid) return;
    const currentUserRef = doc(db, 'Users', uid);
    const targetUserId = post.author.uid;

    try {
      if (isFollowing) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(targetUserId),
        });
        setFollowing((prev) => prev.filter((id) => id !== targetUserId));
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(targetUserId),
        });
        setFollowing((prev) => [...prev, targetUserId]);
      }
    } catch (err) {
      console.error('Failed to update follow:', err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <img
            src={post.author?.photoURL || '/default-profile.png'}
            alt="Author"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-lg">{post.author?.name}</p>
            <p className="text-gray-500 text-sm">@{post.author?.username}</p>
          </div>
        </div>

        {uid && post.author?.uid !== uid && (
          <button
            onClick={handleFollow}
            className={`px-4 py-1 rounded-full text-sm font-medium border transition ${
              isFollowing
                ? 'bg-white text-black border-gray-300 hover:bg-gray-100'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-md">{post.content}</p>

      {/* Date */}
      <p className="text-gray-500 text-sm">{formattedDate}</p>

      {/* Reactions */}
      <div className="border-t border-gray-300 pt-2">
        <div className="flex items-center gap-6 text-gray-600">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 py-1 hover:text-red-500 transition ${
              hasLiked ? 'text-red-500' : ''
            }`}
          >
            <Heart size={20} fill={hasLiked ? 'red' : 'none'} strokeWidth={1.5} />
            <span className="text-sm">{likes.length}</span>
          </button>

          <div className="flex items-center gap-1 py-1 text-gray-500 cursor-default">
            <MessageCircle size={20} strokeWidth={1.5} />
            <span className="text-sm">{post.comments?.length || 0}</span>
          </div>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1 py-1 hover:text-blue-500 transition ${
              hasBookmarked ? 'text-blue-500' : ''
            }`}
          >
            <Bookmark
              size={20}
              fill={hasBookmarked ? '#3B82F6' : 'none'}
              strokeWidth={1.5}
            />
            <span className="text-sm">{bookmarkedBy.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
