'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  getDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebase';
import useAuth from '@/hooks/useAuth';

export default function NotificationPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const notifs = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const notif = docSnap.data();
          const senderRef = doc(db, 'Users', notif.senderId);
          const senderSnap = await getDoc(senderRef);

          return {
            id: docSnap.id,
            ...notif,
            sender: senderSnap.exists() ? senderSnap.data() : null,
          };
        })
      );
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNotificationClick = async (notifId, postId) => {
    try {
      // Update read status to true
      const notifRef = doc(db, 'notifications', notifId);
      await updateDoc(notifRef, { read: true });

      // Navigate to post detail
      router.push(`/post/${postId}`);
    } catch (err) {
      console.error('Failed to update notification:', err);
    }
  };

  return (
    <div className="pl-64 flex min-h-screen bg-white">
      <main className="flex-1 border-x border-gray-200 max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-4">Notifications</h1>

        <ul className="space-y-4">
          {notifications.length === 0 && (
            <li className="text-gray-500">No notifications yet.</li>
          )}

          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`border-y border-gray-200 pb-3 cursor-pointer rounded-md px-3 py-2 transition hover:bg-blue-100 ${
                notif.read ? 'bg-white' : 'bg-blue-50'
              }`}
              onClick={() => handleNotificationClick(notif.id, notif.postId)}
            >
              <div className="flex items-start gap-4">
                <img
                  src={notif.sender?.photoURL || '/assets/images/default-profile.png'}
                  alt="profile"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">
                    {notif.sender?.name || notif.sender?.displayName || 'Unknown User'}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-1">
                    posted: {notif.text || '(no text)'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {notif.timestamp?.toDate
                      ? new Date(notif.timestamp.toDate()).toLocaleString()
                      : ''}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
