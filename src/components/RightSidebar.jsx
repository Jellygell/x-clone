'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebase'; // sesuaikan path

export default function RightSidebar() {
  const [users, setUsers] = useState([]);

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

  return (
    <aside className="w-72 hidden lg:flex flex-col sticky top-0 h-screen p-6 border-l border-gray-200 bg-white">
      <h2 className="text-xl font-bold mb-4">Who to follow</h2>
      <div className="overflow-y-auto pr-2 space-y-4 flex-1">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </div>
            <button className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-600">
              Follow
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
