'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import ProfileContainer from '@/components/ProfileContainer';

export default function UserProfilePage() {
  const { id } = useParams(); // ambil userId dari URL
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe(); // cleanup
  }, []);

  if (!id) return <div className="text-center mt-10">User ID tidak ditemukan</div>;

  return (
    <ProfileContainer userId={id} isCurrentUser={currentUser?.uid === id} />
  );
}
