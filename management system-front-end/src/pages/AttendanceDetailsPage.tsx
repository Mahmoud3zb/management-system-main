import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getAttendanceByIdApi } from "../features/attendance/api";
import { getGroupByIdApi } from "../features/groups/api";
import {
  AttendanceDetailsHeader,
  AttendanceSummary,
  AttendanceDetailsTable,
} from "../features/attendance/components";
import { ROUTES } from "../routes/paths";
import type { AttendanceSheet, Group, AcademicLevel } from "../types";
import type { ApiErrorResponse } from "../services/apiClient";

const getArabicErrorMessage = (err: any, fallback: string): string => {
  const apiErr = err as ApiErrorResponse;
  if (apiErr?.status === 401) {
    return "انتهت جلسة العمل أو غير مصرح، يرجى إعادة تسجيل الدخول.";
  }
  if (apiErr?.status === 403) {
    return "ليس لديك الصلاحية للوصول إلى هذه البيانات.";
  }
  if (apiErr?.status === 404) {
    return "كشف الحضور غير موجود.";
  }
  return apiErr?.message && apiErr.message !== "Unauthorized"
    ? apiErr.message
    : fallback;
};

export const AttendanceDetailsPage: React.FC = () => {
  const { id: attendanceId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const groupIdFromUrl = searchParams.get("groupId");

  const [sheet, setSheet] = useState<AttendanceSheet | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attendanceId) {
      setError("رقم كشف الحضور غير متاح.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const sheetRes = await getAttendanceByIdApi(attendanceId);
        if (!isMounted) return;

        const loadedSheet = sheetRes.data || null;
        setSheet(loadedSheet);


        const targetGroupId = groupIdFromUrl || (typeof loadedSheet?.groupID === "string" ? loadedSheet.groupID : (loadedSheet?.groupID as Group)?._id);
        if (targetGroupId) {
          try {
            const groupRes = await getGroupByIdApi(targetGroupId);
            if (isMounted) {
              setGroup(groupRes.data || null);
            }
          } catch (groupErr) {
            console.error("Failed to load group details:", groupErr);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(getArabicErrorMessage(err, "حدث خطأ أثناء تحميل كشف الغياب التفصيلي."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [attendanceId, groupIdFromUrl]);


  const targetGroupId = groupIdFromUrl || group?._id || (typeof sheet?.groupID === "string" ? sheet.groupID : (sheet?.groupID as Group)?._id);

  const handleBack = () => {
    if (targetGroupId) {
      navigate(`/attendance?groupId=${targetGroupId}`);
    } else {
      navigate(ROUTES.ATTENDANCE);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-100 rounded-full w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded-full w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-3xl text-sm font-bold flex flex-col items-center text-center gap-4">
          <svg className="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error || "كشف الحضور غير موجود."}</p>
          <button
            onClick={handleBack}
            className="bg-[#367ab8] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            العودة لصفحة الغياب
          </button>
        </div>
      </div>
    );
  }

  const records = sheet.present || [];
  const presentCount = records.filter((r) => r.isPresent === true).length;
  const absentCount = records.filter((r) => r.isPresent === false).length;
  const totalStudents = records.length;
  const groupName = group?.name || (typeof sheet.groupID === "object" ? (sheet.groupID as Group).name : "المجموعة الدراسية");
  const groupLevel = group?.level || (typeof sheet.groupID === "object" ? (sheet.groupID as Group).level : undefined) as AcademicLevel | undefined;

  return (
    <div className="space-y-6 text-right" dir="rtl">

      <AttendanceDetailsHeader
        groupName={groupName}
        groupLevel={groupLevel}
        date={sheet.date}
        totalStudents={totalStudents}
        onBack={handleBack}
      />


      <AttendanceSummary
        presentCount={presentCount}
        absentCount={absentCount}
        totalStudents={totalStudents}
      />


      <AttendanceDetailsTable records={records} />
    </div>
  );
};
