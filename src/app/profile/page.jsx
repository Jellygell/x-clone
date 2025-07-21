'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import EditProfileModal from '@/components/modals/EditProfileModal';
import PostList from '@/components/Tweet/PostList';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PostItem from '@/components/Tweet/PostItem';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [userId, setUserId] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    const fetchUser = async (uid) => {
      try {
        const userRef = doc(db, 'Users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUser(user.uid);
      } else {
        setLoading(false); // not logged in
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!userId) return;

      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('likes', 'array-contains', userId));
        const snapshot = await getDocs(q);

        const liked = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setLikedPosts(liked);
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      }
    };

    if (activeTab === 'likes') {
      fetchLikedPosts();
    }
  }, [activeTab, userId]);


  if (loading) return <div className="text-center mt-10">Loading profile...</div>;
  if (!userData) return <div className="text-center mt-10 text-gray-500">User not found.</div>;

  return (
    <div className="pl-64 flex min-h-screen">
      <main className="flex-1 border-x border-gray-200 min-h-screen max-w-2xl mx-auto">
        {/* Cover + Profile Info */}
        <div className="bg-white rounded-lg shadow">
          {/* Cover Image */}
          <div className="relative h-48 bg-gray-200">
            <img
              src={userData.cover}
              alt="Cover"
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute -bottom-10 left-6">
              <img
                src={userData.photoURL}
                alt={userData.name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-14 px-6 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold">{userData.name}</h1>
                <p className="text-gray-500">@{userData.username}</p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="border border-gray-300 text-blue-500 rounded-full px-4 py-1 text-sm font-medium hover:bg-gray-100"
              >
                Edit Profile
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-700">{userData.bio || 'No bio available.'}</p>

            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span>
                <strong className="text-black">{userData.following?.length || 0}</strong> Following
              </span>
              <span>
                <strong className="text-black">{userData.followers?.length || 0}</strong> Followers
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200 px-6">
            <div className="flex justify-around text-sm font-medium text-gray-500">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-3 flex-1 ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('likes')}
                className={`py-3 flex-1 ${activeTab === 'likes' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
              >
                Likes
              </button>
            </div>
          </div>
        </div>

        {/* Post List or Likes */}
        <div className="p-4">
          {activeTab === 'posts' && <PostList userId={userId} />}
          {activeTab === 'likes' && (
            likedPosts.length > 0 ? (
              likedPosts.map(post => (
                <PostItem key={post.id} post={post} />
              ))
            ) : (
              <div className="text-gray-400 text-center mt-4">Belum menyukai postingan apa pun.</div>
            )
          )}
        </div>

        {/* Modal */}
        {showEditModal && (
          <EditProfileModal
            user={userData}
            onClose={() => setShowEditModal(false)}
            onUpdated={() => fetchUser(userData.id)}
          />
        )}
      </main>
    </div>
  );

}
