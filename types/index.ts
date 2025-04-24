export type UserRole = 'student' | 'faculty' | 'parent' | 'admin';

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

export interface ParentUser extends BaseUser {
  role: 'parent';
  studentId?: string;
  relationship?: string;
  phoneNumber?: string;
  address?: string;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
  permissions?: string[];
}

export type User = StudentUser | FacultyUser | ParentUser | AdminUser;

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

export interface PlacementCompany {
  id: string;
  companyName: string;
  salaryPackage: string;
  mode: 'online' | 'offline';
  jobType: 'technical' | 'non-technical';
  description: string;
  requirements: string;
  createdAt: number;
  createdBy: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  attachments?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name?: string;
  }[];
}

export interface SecurityIncident {
  id: string;
  type: 'drug' | 'alcohol' | 'cigarette';
  location: {
    zone: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  timestamp: number;
  status: 'pending' | 'investigating' | 'resolved' | 'false_alarm';
  severity: 'low' | 'medium' | 'high';
  description: string;
  reportedBy: string;
  assignedTo?: string;
  evidence?: {
    type: 'image' | 'video' | 'sensor_data';
    url: string;
  }[];
}

export interface SecurityZone {
  id: string;
  name: string;
  type: 'entrance' | 'parking' | 'building' | 'common_area';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  status: 'active' | 'inactive';
  lastIncident?: number;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  owner: {
    id: string;
    name: string;
    role: UserRole;
  };
  type: 'car' | 'bike' | 'other';
  status: 'authorized' | 'unauthorized' | 'flagged';
  lastCheck: number;
  incidents: string[]; // Array of incident IDs
}

export interface SecurityReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: number;
  endDate: number;
  incidents: SecurityIncident[];
  summary: {
    totalIncidents: number;
    byType: {
      drug: number;
      alcohol: number;
      cigarette: number;
    };
    bySeverity: {
      low: number;
      medium: number;
      high: number;
    };
  };
  generatedBy: string;
  createdAt: number;
}

export interface SecuritySettings {
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  detectionSensitivity: {
    drug: 'low' | 'medium' | 'high';
    alcohol: 'low' | 'medium' | 'high';
    cigarette: 'low' | 'medium' | 'high';
  };
  alertThresholds: {
    drug: number;
    alcohol: number;
    cigarette: number;
  };
  reportSchedule: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  emailRecipients: string[];
}