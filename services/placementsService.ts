import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlacementCompany } from '../types';

export const fetchPlacements = async () => {
  try {
    const placementsRef = collection(db, 'placements');
    const q = query(placementsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    const placements: PlacementCompany[] = [];
    querySnapshot.forEach((doc) => {
      placements.push({ id: doc.id, ...doc.data() } as PlacementCompany);
    });
    
    return placements;
  } catch (error) {
    console.error('Error fetching placements:', error);
    throw error;
  }
};

export const createPlacement = async (placementData: Omit<PlacementCompany, 'id' | 'createdAt'>) => {
  try {
    const placement = {
      ...placementData,
      createdAt: Date.now(),
    };
    
    const docRef = await addDoc(collection(db, 'placements'), placement);
    
    return {
      id: docRef.id,
      ...placement,
    };
  } catch (error) {
    console.error('Error creating placement:', error);
    throw error;
  }
};

export const updatePlacement = async (placementId: string, placementData: Partial<PlacementCompany>) => {
  try {
    const placementRef = doc(db, 'placements', placementId);
    await updateDoc(placementRef, placementData);
    
    return { id: placementId, ...placementData };
  } catch (error) {
    console.error('Error updating placement:', error);
    throw error;
  }
};

export const deletePlacement = async (placementId: string) => {
  try {
    const placementRef = doc(db, 'placements', placementId);
    await deleteDoc(placementRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting placement:', error);
    throw error;
  }
};

export const fetchPlacementsByType = async (jobType: 'technical' | 'non-technical') => {
  try {
    const placementsRef = collection(db, 'placements');
    const q = query(
      placementsRef,
      where('jobType', '==', jobType),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const placements: PlacementCompany[] = [];
    querySnapshot.forEach((doc) => {
      placements.push({ id: doc.id, ...doc.data() } as PlacementCompany);
    });
    
    return placements;
  } catch (error) {
    console.error('Error fetching placements by type:', error);
    throw error;
  }
}; 