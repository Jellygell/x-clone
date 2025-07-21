'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function RightSidebar() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [following, setFollowing] = useState([]);

  // Ambil user login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Ambil field following dari current user
        const currentUserDoc = await getDoc(doc(db, 'Users', user.uid));
        const currentData = currentUserDoc.data();
        setFollowing(currentData?.following || []);
      }
    });

    return () => unsubscribe();
  }, []);

  // Ambil semua user dari DB
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Users'));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Toggle Follow / Unfollow
  const handleFollow = async (targetUserId) => {
    if (!currentUser) return;
    const currentUserRef = doc(db, 'Users', currentUser.uid);
    const isFollowing = following.includes(targetUserId);

    try {
      if (isFollowing) {
        // Unfollow
        console.log(`Unfollowing user ${targetUserId}`);
        await updateDoc(currentUserRef, {
          following: arrayRemove(targetUserId),
        });
        setFollowing((prev) => prev.filter((id) => id !== targetUserId));
      } else {
        // Follow
        console.log(`Following user ${targetUserId}`);
        await updateDoc(currentUserRef, {
          following: arrayUnion(targetUserId),
        });
        setFollowing((prev) => [...prev, targetUserId]);
      }
    } catch (error) {
      console.error('Error updating follow:', error);
    }
  };

  return (
    <aside className="w-72 hidden lg:flex flex-col sticky top-0 h-screen p-6 border-l border-gray-200 bg-white">
      <h2 className="text-xl font-bold mb-4">Who to follow</h2>
      <div className="overflow-y-auto pr-2 space-y-4 flex-1">
        {users
          .filter(user => user.id !== currentUser?.uid) // Jangan tampilkan diri sendiri
          .map((user) => {
            const isFollowing = following.includes(user.id);
            return (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleFollow(user.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    isFollowing
                      ? 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
      </div>
    </aside>
  );
}
