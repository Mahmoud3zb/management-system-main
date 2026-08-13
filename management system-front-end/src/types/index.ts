export type Role = "admin" | "teacher" | "student";
export type UserRole = Role;
export type AcademicLevel = "first" | "second" | "third";

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  parentPhone?: string;
  role?: UserRole;
  groupID?: string | Group;
  level?: AcademicLevel;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  _id: string;
  name: string;
  level: AcademicLevel;
  schedule?: string[];
  studentCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  studentID: string | User;
  isPresent: boolean;
}

export interface AttendanceSheet {
  _id: string;
  groupID: string | Group;
  date: string;
  present?: AttendanceRecord[];
  records?: AttendanceRecord[];
  absent?: AttendanceRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TakeAttendancePayload {
  date: string;
  records: {
    studentID: string;
    isPresent: boolean;
  }[];
}

export interface ExamStudentResultItem {
  studentID: string | User;
  marks: number;
}

export type ExamResult = ExamStudentResultItem;

export interface Exam {
  _id: string;
  groupID: string | Group;
  title: string;
  date: string;
  maxMarks: number;
  results: ExamStudentResultItem[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExamPayload {
  title: string;
  date: string;
  maxMarks: number;
  results: {
    studentID: string;
    marks: number;
  }[];
}

export interface UpdateExamPayload {
  title?: string;
  date?: string;
  maxMarks?: number;
}

export interface UpdateStudentMarkPayload {
  studentID: string;
  marks: number;
}

export interface PaymentItem {
  studentID: string | User;
  isPaid?: boolean;
  paidAt: string;
}

export interface Payment {
  _id: string;
  groupID: string | Group;
  month: string;
  paidList?: PaymentItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RecordPaymentPayload {
  studentID: string;
  month: string;
  isPaid: boolean;
  paidAt: string;
}

export interface GetGroupPaymentsParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}
