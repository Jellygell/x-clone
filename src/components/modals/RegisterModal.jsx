'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { query, collection, where, getDocs } from 'firebase/firestore';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) setVisible(true);
    else setTimeout(() => setVisible(false), 300);
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name || form.name.trim().length < 6) newErrors.name = 'Name must be at least 6 characters';
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.dob) newErrors.dob = 'Date of birth is required';
    else if (calculateAge(form.dob) < 17) newErrors.dob = 'You must be at least 17 years old';

    return newErrors;
  };

  // const handleRegister = async () => {
  //   const validationErrors = validate();
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
  //     const user = userCredential.user;

  //     await setDoc(doc(db, 'Users', user.uid), {
  //       name: form.name,
  //       username: form.username,
  //       email: user.email,
  //       dob: form.dob,
  //       role: 'user',
  //       photoURL: 'https://i.pravatar.cc/40', // default profile photo
  //     });

  //     await setDoc(doc(db, 'Users', user.uid), {
  //       name: form.name,
  //       username: form.username,
  //       email: user.email,
  //       dob: form.dob,
  //       role: 'user',
  //       photoURL: 'https://i.pravatar.cc/150?u=' + user.uid, // unik berdasarkan UID
  //       cover: 'https://images.unsplash.com/photo-1503264116251-35a269479413', // default cover
  //       bio: '',
  //       followers: [],
  //       following: [],
  //       joinedDate: new Date().toISOString(),
  //     });


  //     router.push('/dashboard');
  //     onClose();
  //   } catch (error) {
  //     setErrors({ firebase: error.message });
  //   }
  //   setLoading(false);
  // };


  const handleRegister = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // 1. Cek apakah username sudah digunakan
      const q = query(
        collection(db, 'Users'),
        where('username', '==', form.username)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setErrors({ username: 'Username is already taken' });
        setLoading(false);
        return;
      }

      // 2. Lanjutkan buat akun
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // 3. Simpan data ke Firestore
      await setDoc(doc(db, 'Users', user.uid), {
        name: form.name,
        username: form.username.toLowerCase(),
        email: user.email,
        dob: form.dob,
        role: 'user',
        photoURL: 'https://i.pravatar.cc/150?u=' + user.uid,
        cover: 'https://images.unsplash.com/photo-1503264116251-35a269479413',
        bio: '',
        followers: [],
        following: [],
        joinedDate: new Date().toISOString(),
      });

      router.push('/dashboard');
      onClose();
    } catch (error) {
      setErrors({ firebase: error.message });
    }

    setLoading(false);
  };


  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'bg-black/50' : 'bg-black/0 pointer-events-none'}`}>
      <div className={`relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>

        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <div className="space-y-4">
          {['name', 'username', 'email'].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:ring-2"
              />
              {errors[field] && <div className="text-sm text-red-600">{errors[field]}</div>}
            </div>
          ))}

          {/* Tanggal Lahir */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:ring-2"
            />
            {errors.dob && <div className="text-sm text-red-600">{errors.dob}</div>}
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500"
            >
            </button>
            {errors.password && <div className="text-sm text-red-600 mt-1">{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500"
            >
            </button>
            {errors.confirmPassword && (
              <div className="text-sm text-red-600 mt-1">{errors.confirmPassword}</div>
            )}
          </div>

          {/* Error Firebase */}
          {errors.firebase && <div className="text-sm text-red-600">{errors.firebase}</div>}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-full bg-blue-500 px-4 py-2 mt-2 text-white font-semibold hover:bg-blue-400 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-sm text-center mt-2">
            Already have an account?{' '}
            <span
              onClick={() => {
                onClose(); // tutup register modal terlebih dahulu
                setTimeout(() => {
                  if (onSwitchToLogin) onSwitchToLogin(); // lalu buka login modal
                }, 300); // delay agar animasi penutupan selesai dulu
              }}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
