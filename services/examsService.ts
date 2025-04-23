import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Exam, ExamResult } from '../types';

export const fetchExams = async (department?: string, year?: number, semester?: number) => {
  try {
    const examsRef = collection(db, 'exams');
    let q = query(examsRef, orderBy('date', 'asc'));
    
    if (department) {
      q = query(q, where('department', '==', department));
    }
    
    if (year) {
      q = query(q, where('year', '==', year));
    }
    
    if (semester) {
      q = query(q, where('semester', '==', semester));
    }
    
    const querySnapshot = await getDocs(q);
    
    const exams: Exam[] = [];
    querySnapshot.forEach((doc) => {
      exams.push({ id: doc.id, ...doc.data() } as Exam);
    });
    
    return exams;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

export const fetchUpcomingExams = async (department?: string, year?: number, semester?: number) => {
  try {
    const now = Date.now();
    const examsRef = collection(db, 'exams');
    let q = query(
      examsRef,
      where('date', '>=', now),
      orderBy('date', 'asc')
    );
    
    if (department) {
      q = query(q, where('department', '==', department));
    }
    
    if (year) {
      q = query(q, where('year', '==', year));
    }
    
    if (semester) {
      q = query(q, where('semester', '==', semester));
    }
    
    const querySnapshot = await getDocs(q);
    
    const exams: Exam[] = [];
    querySnapshot.forEach((doc) => {
      exams.push({ id: doc.id, ...doc.data() } as Exam);
    });
    
    return exams;
  } catch (error) {
    console.error('Error fetching upcoming exams:', error);
    throw error;
  }
};

export const createExam = async (examData: Omit<Exam, 'id' | 'createdAt'>) => {
  try {
    const exam = {
      ...examData,
      createdAt: Date.now(),
    };
    
    const docRef = await addDoc(collection(db, 'exams'), exam);
    
    return {
      id: docRef.id,
      ...exam,
    };
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

export const updateExam = async (examId: string, examData: Partial<Exam>) => {
  try {
    const examRef = doc(db, 'exams', examId);
    await updateDoc(examRef, examData);
    
    return { id: examId, ...examData };
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

export const deleteExam = async (examId: string) => {
  try {
    await deleteDoc(doc(db, 'exams', examId));
    return true;
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
};

export const createExamResult = async (resultData: Omit<ExamResult, 'id' | 'createdAt'>) => {
  try {
    const result = {
      ...resultData,
      createdAt: Date.now(),
    };
    
    const docRef = await addDoc(collection(db, 'examResults'), result);
    
    return {
      id: docRef.id,
      ...result,
    };
  } catch (error) {
    console.error('Error creating exam result:', error);
    throw error;
  }
};

export const fetchExamResults = async (studentId: string) => {
  try {
    const resultsRef = collection(db, 'examResults');
    const q = query(
      resultsRef,
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const results: ExamResult[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as ExamResult);
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching exam results:', error);
    throw error;
  }
};