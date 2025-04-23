import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, where, orderBy, Firestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Event } from '../types';

export const fetchEvents = async () => {
  try {
    console.log('Fetching events from Firestore...');
    const eventsRef = collection(db, 'events');
    console.log('Events collection reference created');
    
    const q = query(eventsRef, orderBy('date', 'asc'));
    console.log('Query created with orderBy date asc');
    
    const querySnapshot = await getDocs(q);
    console.log('Query executed, got snapshot with size:', querySnapshot.size);
    
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Event data:', { id: doc.id, ...data });
      events.push({ id: doc.id, ...data } as Event);
    });
    
    console.log('Events fetched successfully:', events.length);
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
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
    console.log('Starting event creation in service...');
    console.log('Event data received:', eventData);
    
    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.location || !eventData.createdBy) {
      console.error('Missing required fields:', {
        title: !eventData.title,
        description: !eventData.description,
        date: !eventData.date,
        location: !eventData.location,
        createdBy: !eventData.createdBy
      });
      throw new Error('Missing required fields for event creation');
    }
    
    let imageUrl;
    
    if (imageUri) {
      console.log('Processing image upload...');
      try {
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log('Image blob created:', blob);
        
        const storageRef = ref(storage, `events/${Date.now()}`);
        console.log('Storage reference created:', storageRef);
        
        const uploadResult = await uploadBytes(storageRef, blob);
        console.log('Image upload successful:', uploadResult);
        
        imageUrl = await getDownloadURL(uploadResult.ref);
        console.log('Image URL obtained:', imageUrl);
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        throw new Error('Failed to process event image');
      }
    }
    
    // Ensure date is a number (timestamp)
    const date = typeof eventData.date === 'number' ? eventData.date : new Date(eventData.date).getTime();
    
    const event = {
      ...eventData,
      date,
      imageUrl,
      createdAt: Date.now(),
      attendees: eventData.attendees || [],
    };
    
    console.log('Creating event document in Firestore...');
    console.log('Final event data:', event);
    
    const eventsRef = collection(db, 'events');
    const docRef = await addDoc(eventsRef, event);
    console.log('Event document created with ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...event,
    };
  } catch (error: any) {
    console.error('Error in createEvent:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to create events');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase service is currently unavailable');
    } else if (error.message === 'Missing required fields for event creation') {
      throw new Error('Please fill in all required fields');
    }
    
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