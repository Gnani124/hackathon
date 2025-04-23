import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqGdNnttC66vQ8vL9aIqlLxfRD11lWk-M",
  authDomain: "jkamma-9fd45.firebaseapp.com",
  projectId: "jkamma-9fd45",
  storageBucket: "jkamma-9fd45.appspot.com",
  messagingSenderId: "37155909399",
  appId: "1:37155909399:android:53283cf008146b78125152"
};

// Initialize Firebase - only if no app exists already
let app;
let auth: Auth;
let storage: FirebaseStorage;
let db: Firestore;

try {
if (getApps().length === 0) {
    console.log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
} else {
    console.log('Using existing Firebase app');
  app = getApps()[0];
  }

  console.log('Initializing Firebase services...');
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { auth, db, storage };