import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Event } from '../types';

export const fetchEvents = async () => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'desc'));
    
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

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>, imageUri?: string) => {
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

export const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: Date.now(),
    });
    
    return { id: eventId, ...eventData };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
    
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

export const checkAndAddMockEvents = async () => {
  try {
    console.log('Checking if events collection exists and has data...');
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    if (querySnapshot.empty) {
      console.log('No events found in database. Adding mock events...');
      
      const mockEvents = [
        {
          title: 'Campus Tech Workshop',
          description: 'Join us for a hands-on workshop on the latest web technologies.',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          time: '10:00 AM',
          place: 'Main Campus, Room 101',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          totalPeople: 50,
          attendees: [],
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          title: 'Student Hackathon',
          description: '24-hour coding challenge for students to showcase their skills.',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          time: '9:00 AM',
          place: 'Innovation Center',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          totalPeople: 100,
          attendees: [],
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          title: 'Career Fair',
          description: 'Meet with potential employers and learn about job opportunities.',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          time: '1:00 PM',
          place: 'Student Center',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          totalPeople: 200,
          attendees: [],
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      for (const event of mockEvents) {
        await addDoc(eventsRef, event);
      }
      
      console.log('Mock events added successfully');
      return true;
    } else {
      console.log('Events collection already has data');
      return false;
    }
  } catch (error) {
    console.error('Error checking/adding mock events:', error);
    return false;
  }
};

export const subscribeToEvents = (callback: (events: Event[]) => void) => {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, orderBy('date', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as Event);
    });
    callback(events);
  });
};