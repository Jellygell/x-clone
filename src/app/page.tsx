'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RegisterModal from '@/components/modals/RegisterModal';
import LoginModal from '@/components/modals/LoginModal';

const SecondaryLayout = () => {
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setTimeout(() => setShowLogin(true), 300); // tunggu animasi modal tutup
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setTimeout(() => setShowRegister(true), 300);
  };

  return (
    <div className="flex h-fit w-screen flex-col justify-between md:h-full md:max-h-screen">
      <div className="flex flex-col md:h-fit md:flex-row">
        {/* Banner kiri */}
        <div className="relative h-[300px] w-full md:h-[95vh] md:w-[40vw] lg:w-[65vw]">
          <Image
            className="h-full w-full object-cover"
            src="/assets/images/X_logo.jpg"
            width={1920}
            height={1080}
            alt="banner"
          />
        </div>

        {/* Form kanan */}
        <div className="flex flex-col gap-5 self-center px-12 py-8 text-black bg-white md:w-[60vw] md:justify-center lg:w-[55vw]">
          <Image
            src="/assets/images/logo.png"
            width={60}
            height={60}
            alt="logo"
          />

          <h1 className="my-5 text-4xl font-bold md:my-8 md:w-fit md:text-6xl">
            Happening now
          </h1>
          <h4 className="text-2xl font-bold md:text-4xl">
            Join today.
          </h4>

          <div className="flex w-[300px] flex-col gap-4">
            <button
              onClick={() => setShowRegister(true)}
              className="w-full rounded-full bg-blue-500 px-4 py-2 mt-7 text-white font-semibold hover:bg-blue-400 cursor-pointer"
            >
              Create Account
            </button>

            {/* Modal Register & Login */}
            <RegisterModal
              isOpen={showRegister}
              onClose={() => setShowRegister(false)}
              onSwitchToLogin={handleSwitchToLogin}
            />
            <LoginModal
              isOpen={showLogin}
              onClose={() => setShowLogin(false)}
              onSwitchToRegister={handleSwitchToRegister}
            />

            <p className="text-xs text-neutral-500">
              By signing up, you agree to the
              <a href="/" className="text-blue-500 hover:underline">
                &nbsp;Terms of Service&nbsp;
              </a>
              and
              <a href="/" className="text-blue-500 hover:underline">
                &nbsp;Privacy Policy
              </a>
              , including
              <a href="/" className="text-blue-500 hover:underline">
                &nbsp;Cookie Use&nbsp;
              </a>
              .
            </p>

            <div className="my-10 flex w-full flex-col gap-4">
              <h4 className="text-black text-base font-semibold">
                Already have an account?
              </h4>
              <button
                onClick={() => setShowLogin(true)}
                className="w-full rounded-full border border-gray-400 px-4 py-2 text-blue-500 font-bold hover:bg-gray-100 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-200 text-center text-sm text-neutral-500 py-4">
        <p>&copy; 2025 X Clone. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SecondaryLayout;
