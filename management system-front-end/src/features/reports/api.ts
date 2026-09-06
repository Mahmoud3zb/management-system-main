import { getGroupsApi, getGroupStudentsApi } from "../groups/api";
import { getGroupAttendanceApi } from "../attendance/api";
import { getGroupExamsApi } from "../exams/api";
import { getGroupPaymentsApi } from "../payments/api";
import type { AcademicLevel } from "../../types";
import type {
  LevelReportResponseData,
  StudentLevelReportItem,
  StudentExamResult,
  StudentPaymentRecord,
} from "./types";

/**
 * Frontend-only aggregation of Level Report using existing backend endpoints
 */
export const getLevelReportApi = async (
  level: AcademicLevel
): Promise<{ data: LevelReportResponseData }> => {
  // 1. Fetch groups for this level
  const groupsRes = await getGroupsApi({ level, limit: 100 });
  const groups = groupsRes.data || [];

  if (groups.length === 0) {
    return {
      data: {
        level,
        summary: {
          totalStudents: 0,
          totalGroups: 0,
          overallAttendanceAvg: 0,
          overallExamAvg: 0,
          groups: [],
        },
        students: [],
      },
    };
  }

  // 2. Fetch students, attendance, exams, and payments for all groups in parallel
  const groupDataPromises = groups.map(async (group) => {
    const groupId = group._id;
    const groupName = group.name;

    const [studentsRes, attendanceRes, examsRes, paymentsRes] = await Promise.allSettled([
      getGroupStudentsApi(groupId),
      getGroupAttendanceApi(groupId, { limit: 100 }),
      getGroupExamsApi(groupId, { limit: 100 }),
      getGroupPaymentsApi(groupId, { limit: 100 }),
    ]);

    const students = studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value.data) ? studentsRes.value.data : [];
    const attendanceSheets = attendanceRes.status === "fulfilled" && Array.isArray(attendanceRes.value.data) ? attendanceRes.value.data : [];
    const exams = examsRes.status === "fulfilled" && Array.isArray(examsRes.value.data) ? examsRes.value.data : [];
    const payments = paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value.data) ? paymentsRes.value.data : [];

    return {
      groupId,
      groupName,
      students,
      attendanceSheets,
      exams,
      payments,
    };
  });

  const groupResults = await Promise.all(groupDataPromises);

  // 3. Process data per student
  const allStudentReports: StudentLevelReportItem[] = [];
  const groupSummaries = groupResults.map((g) => ({
    id: g.groupId,
    name: g.groupName,
    studentCount: g.students.length,
  }));

  let totalAttendancePctSum = 0;
  let studentsWithAttendanceCount = 0;

  let totalExamPctSum = 0;
  let studentsWithExamsCount = 0;

  groupResults.forEach((group) => {
    const totalGroupSessions = group.attendanceSheets.length;

    group.students.forEach((student) => {
      const studentId = student._id;

      // Attendance
      let attendedSessions = 0;
      group.attendanceSheets.forEach((sheet) => {
        const item = (sheet.present || []).find((p) => (p.studentID as any) === studentId || (p.studentID as any)?._id === studentId);
        if (item?.isPresent) {
          attendedSessions += 1;
        }
      });
      const absentSessions = Math.max(0, totalGroupSessions - attendedSessions);
      const attendancePct = totalGroupSessions > 0 ? Math.round((attendedSessions / totalGroupSessions) * 100) : 0;

      if (totalGroupSessions > 0) {
        totalAttendancePctSum += attendancePct;
        studentsWithAttendanceCount += 1;
      }

      // Exams
      let examsCount = 0;
      let totalStudentMarks = 0;
      let totalPossibleMarks = 0;
      const examResultsList: StudentExamResult[] = [];

      group.exams.forEach((ex) => {
        if (ex.isDeleted) return;
        const studentResult = ex.results?.find((r) => (r.studentID as any) === studentId || (r.studentID as any)?._id === studentId);
        if (studentResult) {
          examsCount += 1;
          totalStudentMarks += studentResult.marks || 0;
          totalPossibleMarks += ex.maxMarks || 0;
          examResultsList.push({
            examId: ex._id,
            examTitle: ex.title,
            marks: studentResult.marks,
            maxMarks: ex.maxMarks,
            date: ex.date,
          });
        }
      });

      const averageExamPercentage = totalPossibleMarks > 0 ? Math.round((totalStudentMarks / totalPossibleMarks) * 100) : 0;

      if (totalPossibleMarks > 0) {
        totalExamPctSum += averageExamPercentage;
        studentsWithExamsCount += 1;
      }

      // Payments
      const paidMonthsList: StudentPaymentRecord[] = [];
      group.payments.forEach((pay) => {
        const paidItem = pay.paidList?.find((p) => (p.studentID as any) === studentId || (p.studentID as any)?._id === studentId);
        if (paidItem) {
          paidMonthsList.push({
            month: pay.month,
            paidAt: paidItem.paidAt,
          });
        }
      });

      allStudentReports.push({
        _id: studentId,
        name: student.name,
        phone: student.phone || "",
        parentPhone: student.parentPhone || "",
        groupId: group.groupId,
        groupName: group.groupName,
        attendance: {
          totalGroupSessions,
          attendedSessions,
          absentSessions,
          percentage: attendancePct,
        },
        payments: {
          paidMonthsCount: paidMonthsList.length,
          paidMonths: paidMonthsList,
        },
        exams: {
          examsCount,
          totalStudentMarks,
          totalPossibleMarks,
          averagePercentage: averageExamPercentage,
          results: examResultsList,
        },
      });
    });
  });

  return {
    data: {
      level,
      summary: {
        totalStudents: allStudentReports.length,
        totalGroups: groups.length,
        overallAttendanceAvg: studentsWithAttendanceCount > 0 ? Math.round(totalAttendancePctSum / studentsWithAttendanceCount) : 0,
        overallExamAvg: studentsWithExamsCount > 0 ? Math.round(totalExamPctSum / studentsWithExamsCount) : 0,
        groups: groupSummaries,
      },
      students: allStudentReports,
    },
  };
};
