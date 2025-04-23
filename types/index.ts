export type UserRole = 'student' | 'faculty' | 'parent';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  profilePicture?: string;
  createdAt: number;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  department: string;
  year: number;
  semester: number;
  parentId?: string;
}

export interface Faculty extends User {
  role: 'faculty';
  facultyId: string;
  department: string;
  designation: string;
  subjects: string[];
}

export interface Parent extends User {
  role: 'parent';
  childrenIds: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: number;
  location: string;
  organizer: string;
  imageUrl?: string;
  attendees: string[];
  createdBy: string;
  createdAt: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: number;
  duration: number;
  location: string;
  description?: string;
  department: string;
  year: number;
  semester: number;
  createdBy: string;
  createdAt: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  marks: number;
  totalMarks: number;
  grade?: string;
  feedback?: string;
  createdBy: string;
  createdAt: number;
}