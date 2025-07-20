'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { Camera } from 'lucide-react';

export default function EditProfileModal({ user, onClose, onUpdated }) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [birthDate, setBirthDate] = useState(user.birthDate || '');
  const [cover, setCover] = useState(user.cover || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      type === 'cover' ? setCover(url) : setPhotoURL(url);
    }
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, 'Users', user.id);
      await updateDoc(userRef, {
        name,
        bio,
        location,
        birthDate,
        cover,
        photoURL,
      });
      onUpdated();
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Cover */}
        <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100">
          <img src={cover} alt="Cover" className="w-full h-full object-cover" />
          <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 text-white text-2xl">
            <Camera className="w-6 h-6 text-white" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'cover')}
            />
          </label>
        </div>

        {/* Profile Picture */}
        <div className="relative w-24 h-24 -mt-12 mx-auto rounded-full overflow-hidden border-4 border-white bg-gray-100">
          <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
          <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 text-white text-xl rounded-full">
            <Camera className="w-6 h-6 text-white" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'profile')}
            />
          </label>
        </div>

        {/* Form Inputs */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Birth Date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 text-right">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
