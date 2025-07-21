'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import ProfileContainer from '@/components/ProfileContainer';

export default function ProfilePage() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  if (!userId) return <div className="text-center mt-10">Memuat profil...</div>;

  return <ProfileContainer userId={userId} isCurrentUser={true} />;
}
