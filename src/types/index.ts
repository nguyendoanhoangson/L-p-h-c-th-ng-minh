export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  schoolId?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  currentAcademicYear: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g., "2024 - 2025"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface GradeLevel {
  id: string;
  level: number; // 1 to 12
  name: string; // "Khối 1", "Khối 2", ..., "Khối 12"
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  gradeLevels: number[];
}

export interface Classroom {
  id: string;
  name: string;
  gradeLevel: number; // 1 - 12
  academicYear: string;
  room: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  maxStudents: number;
  subject?: string;
  colorTheme?: string;
  joinCode?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  description?: string;
}

export interface ParentInfo {
  fatherOrMotherName: string; // Tên bố / mẹ
  phone: string;
  email?: string;
  permanentAddress: string; // Địa chỉ thường trú (kéo dài)
  relationship?: 'Bố' | 'Mẹ' | 'Người giám hộ';
  note?: string;
}

export interface Student {
  id: string;
  studentCode: string; // Mã HS
  fullName: string;
  dob: string; // Ngày sinh
  gender: 'Nam' | 'Nữ';
  classId: string;
  className: string;
  gradeLevel: number;
  rollNumber?: number; // STT trong sổ
  teamNumber?: number; // Tổ
  avatar?: string;
  status: 'STUDYING' | 'SUSPENDED' | 'TRANSFERRED' | 'DROPPED'; // Đang học / Bảo lưu / Chuyển trường / Thôi học
  parent: ParentInfo;
  notes?: string;
  createdAt: string;
}

export type AttendanceStatus = 'PRESENT' | 'EXCUSED_ABSENCE' | 'UNEXCUSED_ABSENCE' | 'LATE' | 'EARLY_LEAVE';

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  period: number; // Tiết học (1-10) or buổi (Sáng/Chiều)
  status: AttendanceStatus;
  reason?: string;
  recordedBy: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  subject: string;
  maxScore: number;
  dueDate: string;
  createdAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  submittedCount: number;
  totalStudents: number;
  attachments?: string[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'LATE' | 'GRADED' | 'RESUBMIT_REQUIRED';
}

export interface Question {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string | number;
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  gradeLevel: number;
  classId: string;
  durationMinutes: number;
  questions: Question[];
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  totalQuestions: number;
}

export interface GradeItem {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  subject: string;
  oralScore?: number; // Điểm miệng
  test15m?: number; // 15 phút
  test45m?: number; // 1 tiết
  midTerm?: number; // Giữa kỳ
  finalTerm?: number; // Cuối kỳ
  averageScore?: number; // Điểm trung bình
  semester: 'HK1' | 'HK2';
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  type: 'POSITIVE' | 'NEED_IMPROVEMENT';
  content: string;
  date: string;
  recordedBy: string;
  points: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'ALL' | 'STUDENT' | 'PARENT' | 'TEACHER';
  classId?: string; // or specific class
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  authorName: string;
  createdAt: string;
  readCount: number;
  attachments?: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export type TimetableScheduleType = 'CLASS' | 'TEACHER' | 'ROOM';

export interface TimetablePeriod {
  id: string;
  periodNumber: number;
  name: string;
  timeRange: string;
}

export interface TimetableData {
  id: string;
  type: TimetableScheduleType;
  targetId: string;
  targetName: string;
  days: string[];
  periods: TimetablePeriod[];
  cells: Record<string, string>;
  updatedAt?: string;
}

