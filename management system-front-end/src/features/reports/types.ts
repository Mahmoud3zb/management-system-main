import type { AcademicLevel } from "../../types";

export interface StudentExamResult {
  examId: string;
  examTitle: string;
  marks: number;
  maxMarks: number;
  date: string;
}

export interface StudentPaymentRecord {
  month: string;
  paidAt: string;
}

export interface StudentLevelReportItem {
  _id: string;
  name: string;
  phone: string;
  parentPhone: string;
  groupId: string;
  groupName: string;
  attendance: {
    totalGroupSessions: number;
    attendedSessions: number;
    absentSessions: number;
    percentage: number;
  };
  payments: {
    paidMonthsCount: number;
    paidMonths: StudentPaymentRecord[];
  };
  exams: {
    examsCount: number;
    totalStudentMarks: number;
    totalPossibleMarks: number;
    averagePercentage: number;
    results: StudentExamResult[];
  };
}

export interface LevelGroupSummary {
  id: string;
  name: string;
  studentCount: number;
}

export interface LevelReportSummary {
  totalStudents: number;
  totalGroups: number;
  overallAttendanceAvg: number;
  overallExamAvg: number;
  groups: LevelGroupSummary[];
}

export interface LevelReportResponseData {
  level: AcademicLevel;
  summary: LevelReportSummary;
  students: StudentLevelReportItem[];
}
