export type UserRole = 'student' | 'faculty';

interface BaseUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  profilePicture?: string;
  createdAt: number;
}

export interface StudentUser extends BaseUser {
  role: 'student';
  rollNumber?: string;
  studentId?: string;
  department?: string;
  year?: string;
  semester?: string;
  course?: string;
  areaOfInterest?: string;
  skills?: string[];
  phoneNumber?: string;
  attendance?: {
    present: number;
    absent: number;
    total: number;
    percentage: number;
  };
}

export interface FacultyUser extends BaseUser {
  role: 'faculty';
  department?: string;
  designation?: string;
  qualification?: string;
}

export type User = StudentUser | FacultyUser;

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  place: string;
  location?: string;
  image: string;
  imageUrl?: string;
  totalPeople: number;
  attendees?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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