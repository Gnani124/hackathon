import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqGdNnttC66vQ8vL9aIqlLxfRD11lWk-M",
  authDomain: "jkamma-9fd45.firebaseapp.com",
  projectId: "jkamma-9fd45",
  storageBucket: "jkamma-9fd45.firebasestorage.app",
  messagingSenderId: "37155909399",
  appId: "1:37155909399:android:53283cf008146b78125152"
};

// Initialize Firebase - only if no app exists already
let app;
let auth: Auth;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

// Initialize Firebase services
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };