import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth as Auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            
            // Navigate based on user role
            if (userData.role === 'admin') {
              router.replace('/(admin)/dashboard');
            } else {
              router.replace('/(tabs)');
            }
          } else {
            // If user document doesn't exist, sign out
            await signOut(auth as Auth);
            setUser(null);
            await AsyncStorage.removeItem('user');
            router.replace('/(auth)/sign-in');
          }
        } else {
          setUser(null);
          await AsyncStorage.removeItem('user');
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
        await AsyncStorage.removeItem('user');
        router.replace('/(auth)/sign-in');
      } finally {
        setIsLoading(false);
      }
    });

    // Check for cached user on load
    const loadCachedUser = async () => {
      try {
        const cachedUser = await AsyncStorage.getItem('user');
        if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          
          // Navigate based on cached user role
          if (userData.role === 'admin') {
            router.replace('/(admin)/dashboard');
          } else {
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        console.error('Error loading cached user:', error);
      }
    };

    loadCachedUser();

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting sign in process...');
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth as Auth, email, password);
      const userId = userCredential.user.uid;
      console.log('User signed in with Firebase Auth:', userId);
      
      // Get the user document from Firestore
      const userDocRef = doc(db, 'users', userId);
      console.log('Fetching user document from Firestore...');
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log('User document found:', userData);
        
        // Set the user in state and AsyncStorage
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log('User state and AsyncStorage updated');
        
        // Navigate based on user role
        if (userData.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        console.error('User document not found in Firestore');
        throw new Error('User document not found. Please try signing up again.');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.message === 'User document not found. Please try signing up again.') {
        errorMessage = 'Account not found. Please sign up first';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    try {
      setIsLoading(true);
      console.log('Starting sign up process...');
      
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth as Auth, email, password);
      const userId = userCredential.user.uid;
      console.log('User created in Firebase Auth:', userId);
      
      // Create user document in Firestore
      const userData: User = {
        id: userId,
        email,
        displayName,
        role,
        createdAt: Date.now(),
      };
      
      console.log('Creating user document in Firestore:', userData);
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, userData);
      console.log('User document created successfully');
      
      // Set the user in state and AsyncStorage
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log('User state and AsyncStorage updated');
      
      // Navigate to the tabs screen
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw new Error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth as Auth);
      setUser(null);
      await AsyncStorage.removeItem('user');
      router.replace('/(auth)/sign-in');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user?.id) {
        throw new Error('No user logged in');
      }

      console.log('Updating user profile...');
      console.log('User ID:', user.id);
      console.log('Updates:', updates);

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updates);
      console.log('Firestore update successful');

      // Update local user state
      const updatedUser = { ...user, ...updates };
      console.log('New user state:', updatedUser);
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Local state and AsyncStorage updated');
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, logout, updateUserProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};