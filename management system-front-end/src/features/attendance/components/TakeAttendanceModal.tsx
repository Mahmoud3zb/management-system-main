import React, { useEffect, useState } from "react";
import { getGroupStudentsApi } from "../../groups/api";
import { takeAttendanceApi } from "../api";
import { AttendanceStudentRow } from "./AttendanceStudentRow";
import type { User } from "../../../types";
import type { ApiErrorResponse } from "../../../services/apiClient";

interface TakeAttendanceModalProps {
  isOpen: boolean;
  groupId: string | null;
  groupName: string;
  onSuccess: (message: string) => void;
  onClose: () => void;
}


const getTodayLocalDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const TakeAttendanceModal: React.FC<TakeAttendanceModalProps> = ({
  isOpen,
  groupId,
  groupName,
  onSuccess,
  onClose,
}) => {
  const [date, setDate] = useState<string>(getTodayLocalDate());
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>({});

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!isOpen || !groupId) return;

    let isMounted = true;

    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      setError(null);

      try {
        const response = await getGroupStudentsApi(groupId);
        if (!isMounted) return;

        const activeStudents = response.data || [];
        setStudents(activeStudents);


        const initialState: Record<string, boolean> = {};
        activeStudents.forEach((s) => {
          initialState[s._id] = true;
        });
        setAttendanceState(initialState);
      } catch (err: any) {
        if (isMounted) {
          const apiErr = err as ApiErrorResponse;
          setError(apiErr?.message || "تعذر تحميل قائمة طلاب المجموعة.");
        }
      } finally {
        if (isMounted) setIsLoadingStudents(false);
      }
    };

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, [isOpen, groupId]);

  if (!isOpen) return null;


  const handleToggleStudent = (studentId: string, isPresent: boolean) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: isPresent,
    }));
  };


  const handleSetAll = (isPresent: boolean) => {
    const newState: Record<string, boolean> = {};
    students.forEach((s) => {
      newState[s._id] = isPresent;
    });
    setAttendanceState(newState);
  };


  const presentCount = students.filter((s) => attendanceState[s._id] === true).length;
  const absentCount = students.filter((s) => attendanceState[s._id] === false).length;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;

    if (!date) {
      setError("الرجاء اختيار تاريخ الحصة");
      return;
    }

    if (students.length === 0) {
      setError("لا يوجد طلاب في هذه المجموعة لتسجيل الحضور");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        date,
        present: students.map((s) => ({
          studentID: s._id,
          isPresent: attendanceState[s._id] ?? true,
        })),
      };

      await takeAttendanceApi(groupId, payload);

      onSuccess("تم تسجيل الحضور بنجاح");
      onClose();
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr.status === 400) {
        setError(apiErr?.message || "بيانات الغياب غير صحيحة، يرجى التأكد وإعادة المحاولة.");
      } else if (apiErr.status === 401) {
        setError("انتهت جلسة العمل، يرجى إعادة تسجيل الدخول.");
      } else {
        setError(apiErr?.message || "حدث خطأ أثناء حفظ كشف الغياب.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">

        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#ce5071] rounded-full"></span>
              <h3 className="text-base font-black text-slate-900">تسجيل حضور حصة</h3>
            </div>
            <p className="text-xs font-bold text-[#367ab8] mt-0.5 mr-3.5">
              مجموعة: {groupName}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-1.5">
            <label htmlFor="attendanceDate" className="text-xs font-bold text-slate-700">
              تاريخ الحصة <span className="text-rose-500">*</span>
            </label>
            <input
              id="attendanceDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#ce5071] focus:ring-4 focus:ring-[#ce5071]/15 transition-all cursor-pointer"
            />
          </div>


          {!isLoadingStudents && students.length > 0 && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-lg">
                  حاضر: {presentCount}
                </span>
                <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-2.5 py-1 rounded-lg">
                  غائب: {absentCount}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetAll(true)}
                  className="text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  تحديد الكل حاضر
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleSetAll(false)}
                  className="text-[11px] font-bold text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  تحديد الكل غائب
                </button>
              </div>
            </div>
          )}


          {isLoadingStudents ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="h-12 bg-slate-100 rounded-2xl animate-pulse w-full"></div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 border border-slate-200 border-dashed rounded-2xl text-center">
              <p className="text-xs font-extrabold text-slate-600">لا يوجد طلاب في هذه المجموعة</p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                قم بإضافة طلاب أولاً لإمكانية تسجيل كشف الغياب.
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 pl-1 scrollbar-thin">
              {students.map((student) => (
                <AttendanceStudentRow
                  key={student._id}
                  student={student}
                  isPresent={attendanceState[student._id] ?? true}
                  onToggle={handleToggleStudent}
                />
              ))}
            </div>
          )}


          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingStudents || students.length === 0}
              className="px-6 py-2.5 bg-[#ce5071] hover:bg-[#b84361] text-white font-bold rounded-xl text-xs shadow-md shadow-[#ce5071]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </span>
              ) : (
                "حفظ كشف الغياب"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
