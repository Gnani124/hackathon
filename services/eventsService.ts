import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Event } from '../types';

export const fetchEvents = async () => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as Event);
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchUpcomingEvents = async () => {
  try {
    const now = Date.now();
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('date', '>=', now),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as Event);
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

export const createEvent = async (
  eventData: Omit<Event, 'id' | 'createdAt'>,
  imageUri?: string
) => {
  try {
    let imageUrl;
    
    if (imageUri) {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `events/${Date.now()}`);
      const uploadResult = await uploadBytes(storageRef, blob);
      imageUrl = await getDownloadURL(uploadResult.ref);
    }
    
    const event = {
      ...eventData,
      imageUrl,
      createdAt: Date.now(),
    };
    
    const docRef = await addDoc(collection(db, 'events'), event);
    
    return {
      id: docRef.id,
      ...event,
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (
  eventId: string,
  eventData: Partial<Event>,
  imageUri?: string
) => {
  try {
    const updates: Partial<Event> = { ...eventData };
    
    if (imageUri) {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `events/${Date.now()}`);
      const uploadResult = await uploadBytes(storageRef, blob);
      updates.imageUrl = await getDownloadURL(uploadResult.ref);
    }
    
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, updates);
    
    return { id: eventId, ...updates };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const attendEvent = async (eventId: string, userId: string) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      attendees: [...(await getDocs(collection(db, 'events')).then(
        (snapshot) => snapshot.docs.find(doc => doc.id === eventId)?.data().attendees || []
      )), userId]
    });
    return true;
  } catch (error) {
    console.error('Error attending event:', error);
    throw error;
  }
};