'use client';

import { useRouter } from 'next/navigation';
import { Home, Search, Bell, User, Pencil } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { useState } from 'react';
import PostModal from './modals/PostModal';

export default function Sidebar({ user }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen bg-white border-r border-gray-200 p-6 flex flex-col justify-between z-10">
      <div className="space-y-6">
        <div className="text-2xl font-bold mb-6">X Clone</div>
        <NavItem icon={<Home />} label="Home" onClick={() => router.push('/dashboard')} />
        <NavItem icon={<Search />} label="Explore" onClick={() => router.push('/explore')} />
        <NavItem icon={<Bell />} label="Notifications" onClick={() => router.push('/notifications')} />
        <NavItem icon={<User />} label="Profile" onClick={() => router.push('/profile')} />
        {/* <button className="w-full bg-blue-500 text-white py-2 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 mt-6">
          <Pencil size={18} />
          Post
        </button> */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-blue-500 text-white py-2 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 mt-6"
        >
          Post
        </button>

        {isOpen && <PostModal onClose={() => setIsOpen(false)} />}
      </div>

      {/* User Info */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <img
            src="/assets/images/default-profile.png"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-sm">
            <p className="font-semibold">{user?.email.split('@')[0]}</p>
            <p className="text-gray-500 text-xs">@{user?.email.split('@')[0]}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-red-500 text-xs hover:underline">
          Logout
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, onClick }) {
  return (
    <button
      className="flex items-center gap-4 w-full text-left text-gray-700 hover:text-blue-500 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all"
      onClick={onClick}
    >
      <span>{icon}</span>
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}
