// src/firebase/firebase.js

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCq3gYLnNB4jhcbVQpCwhlyDyoepqVooZ8',
  authDomain: 'project-bootcamp-fe.firebaseapp.com',
  projectId: 'project-bootcamp-fe',
  storageBucket: 'project-bootcamp-fe.appspot.com',
  messagingSenderId: '1090246485482',
  appId: '1:1090246485482:web:70a44117023cccba55fe93',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
