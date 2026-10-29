import { getGroupsApi, getGroupStudentsApi } from "../groups/api";
import { getGroupPaymentsApi, getPaymentByIdApi } from "./api";
import { getStudentId, isPaymentRecordPaid } from "./utils";
import type { Group, User, Payment, AcademicLevel } from "../../types";

export interface UnpaidStudentItem {
  id: string; // unique key: `${groupId}_${studentId}_${month}`
  studentId: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  groupId: string;
  groupName: string;
  groupLevel: AcademicLevel | string;
  month: string;
  hasSheet: boolean;
  isRecorded: boolean;
  statusText: string;
}

export interface PaidStudentItem {
  id: string; // unique key: `${groupId}_${studentId}_${month}`
  studentId: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  groupId: string;
  groupName: string;
  groupLevel: AcademicLevel | string;
  month: string;
  paidAt?: string;
}

export interface GroupUnpaidBundle {
  group: Group;
  students: User[];
  sheets: Payment[];
}

export interface UnpaidAggregationResult {
  bundles: GroupUnpaidBundle[];
  availableMonths: string[];
}

/**
 * Returns current month formatted as YYYY-MM
 */
export const getCurrentMonth = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/**
 * Fetches all groups, their students, and detailed payment sheets.
 * Executes requests in parallel with Promise.allSettled for maximum resilience.
 */
export const fetchAllGroupsPaymentsData = async (): Promise<UnpaidAggregationResult> => {
  const groupsRes = await getGroupsApi({ limit: 100 });
  const groups = groupsRes.data || [];

  if (groups.length === 0) {
    return { bundles: [], availableMonths: [getCurrentMonth()] };
  }

  const bundlesPromises = groups.map(async (group): Promise<GroupUnpaidBundle> => {
    const groupId = group._id;

    const [studentsRes, paymentsRes] = await Promise.allSettled([
      getGroupStudentsApi(groupId),
      getGroupPaymentsApi(groupId, { limit: 50 }),
    ]);

    const students =
      studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value.data)
        ? studentsRes.value.data
        : [];

    const paymentHeaders =
      paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value.data)
        ? paymentsRes.value.data
        : [];

    // Detailed sheets with paidList
    const detailedSheets = await Promise.all(
      paymentHeaders.map(async (header) => {
        try {
          const detailRes = await getPaymentByIdApi(header._id);
          return detailRes.data || header;
        } catch {
          return header;
        }
      })
    );

    return {
      group,
      students,
      sheets: detailedSheets,
    };
  });

  const bundles = await Promise.all(bundlesPromises);

  // Collect all unique recorded months across all sheets
  const monthsSet = new Set<string>();
  bundles.forEach((b) => {
    b.sheets.forEach((s) => {
      if (s.month) monthsSet.add(s.month);
    });
  });

  // Ensure current month is available as a baseline
  monthsSet.add(getCurrentMonth());

  const availableMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));

  return {
    bundles,
    availableMonths,
  };
};

/**
 * Filters the aggregated bundles to find unpaid students for a selected month (or all months).
 */
export const filterUnpaidStudents = (
  bundles: GroupUnpaidBundle[],
  selectedMonth: string
): UnpaidStudentItem[] => {
  const unpaidItems: UnpaidStudentItem[] = [];

  bundles.forEach(({ group, students, sheets }) => {
    const groupId = group._id;
    const groupName = group.name;
    const groupLevel = group.level;

    if (students.length === 0) return;

    if (selectedMonth === "all") {
      // Check all recorded months for this group
      sheets.forEach((sheet) => {
        const month = sheet.month;
        const paidList = sheet.paidList || [];
        const studentPaidMap = new Map<string, any>();

        paidList.forEach((p) => {
          const sId = getStudentId(p.studentID);
          if (sId) studentPaidMap.set(sId, p);
        });

        students.forEach((student) => {
          const rec = studentPaidMap.get(student._id);
          const isPaid = rec ? isPaymentRecordPaid(rec) : false;

          if (!isPaid) {
            unpaidItems.push({
              id: `${groupId}_${student._id}_${month}`,
              studentId: student._id,
              studentName: student.name,
              studentPhone: student.phone || "-",
              parentPhone: student.parentPhone || "-",
              groupId,
              groupName,
              groupLevel,
              month,
              hasSheet: true,
              isRecorded: Boolean(rec),
              statusText: rec ? "غير مدفوع" : "لم يُرصد بالكشف بعد",
            });
          }
        });
      });
    } else {
      // Target a specific month
      const sheet = sheets.find((s) => s.month === selectedMonth);
      const paidList = sheet?.paidList || [];
      const studentPaidMap = new Map<string, any>();

      paidList.forEach((p) => {
        const sId = getStudentId(p.studentID);
        if (sId) studentPaidMap.set(sId, p);
      });

      students.forEach((student) => {
        const rec = studentPaidMap.get(student._id);
        const isPaid = rec ? isPaymentRecordPaid(rec) : false;

        if (!isPaid) {
          unpaidItems.push({
            id: `${groupId}_${student._id}_${selectedMonth}`,
            studentId: student._id,
            studentName: student.name,
            studentPhone: student.phone || "-",
            parentPhone: student.parentPhone || "-",
            groupId,
            groupName,
            groupLevel,
            month: selectedMonth,
            hasSheet: Boolean(sheet),
            isRecorded: Boolean(rec),
            statusText: !sheet
              ? "لم يُفتح كشف للشهر بعد"
              : rec
              ? "غير مدفوع"
              : "لم يُرصد بالكشف بعد",
          });
        }
      });
    }
  });

  return unpaidItems;
};

/**
 * Filters the aggregated bundles to find paid students for a selected month (or all months).
 */
export const filterPaidStudents = (
  bundles: GroupUnpaidBundle[],
  selectedMonth: string
): PaidStudentItem[] => {
  const paidItems: PaidStudentItem[] = [];

  bundles.forEach(({ group, students, sheets }) => {
    const groupId = group._id;
    const groupName = group.name;
    const groupLevel = group.level;

    if (students.length === 0) return;

    // Student map for fast lookup
    const studentMap = new Map<string, User>();
    students.forEach((s) => studentMap.set(s._id, s));

    const targetSheets =
      selectedMonth === "all"
        ? sheets
        : sheets.filter((s) => s.month === selectedMonth);

    targetSheets.forEach((sheet) => {
      const month = sheet.month;
      const paidList = sheet.paidList || [];

      paidList.forEach((p) => {
        const sId = getStudentId(p.studentID);
        if (!sId) return;

        const isPaid = isPaymentRecordPaid(p);
        if (isPaid) {
          const studentObj =
            studentMap.get(sId) ||
            (typeof p.studentID === "object" ? (p.studentID as User) : null);
          const studentName = studentObj ? studentObj.name : "طالب مسجل";
          const studentPhone = studentObj ? studentObj.phone || "-" : "-";
          const parentPhone = studentObj ? studentObj.parentPhone || "-" : "-";

          paidItems.push({
            id: `${groupId}_${sId}_${month}`,
            studentId: sId,
            studentName,
            studentPhone,
            parentPhone,
            groupId,
            groupName,
            groupLevel,
            month,
            paidAt: p.paidAt && p.paidAt !== "-" ? p.paidAt : undefined,
          });
        }
      });
    });
  });

  return paidItems;
};
