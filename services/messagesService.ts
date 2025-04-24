import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message } from '../types';

export const sendMessage = async (messageData: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
  try {
    const message = {
      ...messageData,
      timestamp: Date.now(),
      isRead: false,
    };
    
    const docRef = await addDoc(collection(db, 'messages'), message);
    
    return {
      id: docRef.id,
      ...message,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const fetchMessages = async (userId1: string, userId2: string) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('senderId', 'in', [userId1, userId2]),
      where('receiverId', 'in', [userId1, userId2]),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, { isRead: true });
    
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  userId1: string,
  userId2: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('senderId', 'in', [userId1, userId2]),
    where('receiverId', 'in', [userId1, userId2]),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    callback(messages);
  });
};

export const fetchUnreadMessages = async (userId: string) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('isRead', '==', false),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    
    return messages;
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    throw error;
  }
}; 