'use client';

import { useState, useRef, useEffect } from 'react';
import { ImageIcon, SmileIcon, X } from 'lucide-react';
import { db, storage } from '@/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export default function PostForm( { onPostSuccess, user: overrideUser } ) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // array of { file, url }
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  // Ambil user dari Firebase Auth
  useEffect(() => {
  if (overrideUser) {
    setUser(overrideUser);
  } else {
    const auth = getAuth();
    setUser(auth.currentUser);
  }
}, [overrideUser]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const imagePreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...imagePreviews]);
  };

  const handleRemoveImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!user) {
      alert('Anda harus login untuk membuat post.');
      return;
    }

    if (!content.trim() && images.length === 0) return;
    if (content.length > 300) return alert('Content max 300 characters');

    setIsPosting(true);

    try {
      const imageUrls = [];

      for (const image of images) {
        const storageRef = ref(storage, `posts/${Date.now()}_${image.file.name}`);
        const snapshot = await uploadBytes(storageRef, image.file);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }

      const postRef = await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        content: content.trim(),
        images: imageUrls,
        likes: [],
        comments: [],
        bookmarkedBy: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Post created with ID:', postRef.id);

      setContent('');
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error posting:', error);
    } finally {
      setIsPosting(false);
    }

    if (onPostSuccess) onPostSuccess();
  };

  return (
    <div className="flex gap-4 border-b pb-4">
      <img
        src={user?.photoURL || 'https://i.pravatar.cc/40'}
        alt="Avatar"
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 300))}
          placeholder="What's happening?"
          className="w-full border-none focus:ring-0 resize-none bg-transparent text-lg"
          rows={3}
        />
        <p className="text-sm text-gray-400 text-right">{content.length}/300</p>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2 max-w-md">
            {images.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img.url}
                  alt="Preview"
                  className="rounded-xl max-h-48 object-cover w-full"
                />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-4 text-blue-500 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-blue-600"
              type="button"
            >
              <ImageIcon size={20} />
            </button>
            <button type="button" className="hover:text-blue-600">
              <SmileIcon size={20} />
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>

          <button
            onClick={handlePost}
            disabled={isPosting}
            className="bg-blue-500 text-white py-1 px-4 rounded-full hover:bg-blue-600 disabled:opacity-50"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
