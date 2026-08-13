import React, { useState, useEffect } from "react";
import { getGroupStudentsApi } from "../../groups/api";
import { createExamApi } from "../api";
import { ExamStudentMarkRow } from "./ExamStudentMarkRow";
import type { User, CreateExamPayload } from "../../../types";
import type { ApiErrorResponse } from "../../../services/apiClient";

interface CreateExamModalProps {
  isOpen: boolean;
  groupId: string | null;
  groupName: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const getTodayFormattedDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  groupId,
  groupName,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(getTodayFormattedDate());
  const [maxMarks, setMaxMarks] = useState<string>("100");
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});

  const [students, setStudents] = useState<User[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !groupId) {
      return;
    }

    let isMounted = true;
    setIsLoadingStudents(true);
    setError(null);
    setTitle("");
    setDate(getTodayFormattedDate());
    setMaxMarks("100");
    setMarksMap({});

    const fetchStudents = async () => {
      try {
        const response = await getGroupStudentsApi(groupId);
        if (isMounted) {
          const loadedStudents = response.data || [];
          setStudents(loadedStudents);

          const initialMarks: Record<string, string> = {};
          loadedStudents.forEach((s) => {
            initialMarks[s._id] = "";
          });
          setMarksMap(initialMarks);
        }
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

  const handleMarkChange = (studentId: string, val: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: val,
    }));
  };

  const handleSetAllMarks = (value: string) => {
    const updated: Record<string, string> = {};
    students.forEach((s) => {
      updated[s._id] = value;
    });
    setMarksMap(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!groupId) {
      setError("يرجى اختيار مجموعة أولاً لتسجيل الامتحان.");
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("عنوان الامتحان مطلوب.");
      return;
    }

    const trimmedDate = date.trim();
    if (!trimmedDate) {
      setError("تاريخ الامتحان مطلوب.");
      return;
    }

    const parsedMax = parseFloat(maxMarks);
    if (isNaN(parsedMax) || parsedMax <= 0) {
      setError("الدرجة النهائية يجب أن تكون رقماً أكبر من 0.");
      return;
    }

    if (students.length === 0) {
      setError("لا يوجد طلاب في هذه المجموعة لتسجيل الامتحان لهم.");
      return;
    }

    const results = [];
    for (const student of students) {
      const rawVal = marksMap[student._id] ?? "";
      const valString = rawVal.trim() === "" ? "0" : rawVal.trim();
      const parsedMark = parseFloat(valString);

      if (isNaN(parsedMark)) {
        setError(`درجة الطالب (${student.name}) غير صحيحة.`);
        return;
      }

      if (parsedMark < 0) {
        setError(`درجة الطالب (${student.name}) لا يمكن أن تكون بالسالب.`);
        return;
      }

      if (parsedMark > parsedMax) {
        setError(
          `درجة الطالب (${student.name}) وهي ${parsedMark} تتجاوز الدرجة النهائية (${parsedMax}).`
        );
        return;
      }

      results.push({
        studentID: student._id,
        marks: parsedMark,
      });
    }

    const payload: CreateExamPayload = {
      title: trimmedTitle,
      date: trimmedDate,
      maxMarks: parsedMax,
      results,
    };

    setIsSubmitting(true);

    try {
      await createExamApi(groupId, payload);
      onSuccess("تم تسجيل الامتحان بنجاح");
      onClose();
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr?.status === 401) {
        setError("انتهت جلسة العمل، يرجى إعادة تسجيل الدخول.");
      } else if (apiErr?.status === 400) {
        setError(apiErr.message || "بيانات الامتحان غير صالحة، يرجى التحقق والتكرار.");
      } else {
        setError(apiErr?.message || "حدث خطأ أثناء حفظ الامتحان، يرجى المحاولة مرة أخرى.");
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
              <span className="w-1.5 h-5 bg-[#e1b54d] rounded-full"></span>
              <h3 className="text-base font-black text-slate-900">تسجيل امتحان جديد</h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1">
              <label htmlFor="examTitle" className="text-xs font-bold text-slate-700 block">
                عنوان الامتحان <span className="text-rose-500">*</span>
              </label>
              <input
                id="examTitle"
                type="text"
                required
                disabled={isSubmitting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: شهر أغسطس"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#e1b54d] focus:ring-4 focus:ring-[#e1b54d]/15 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="examDate" className="text-xs font-bold text-slate-700 block">
                تاريخ الامتحان <span className="text-rose-500">*</span>
              </label>
              <input
                id="examDate"
                type="date"
                required
                disabled={isSubmitting}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#e1b54d] focus:ring-4 focus:ring-[#e1b54d]/15 transition-all cursor-pointer dir-ltr text-right"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="maxMarks" className="text-xs font-bold text-slate-700 block">
                الدرجة النهائية <span className="text-rose-500">*</span>
              </label>
              <input
                id="maxMarks"
                type="number"
                min="1"
                step="1"
                required
                disabled={isSubmitting}
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#e1b54d] focus:ring-4 focus:ring-[#e1b54d]/15 transition-all dir-ltr text-right"
              />
            </div>
          </div>


          {!isLoadingStudents && students.length > 0 && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
              <span className="text-[11px] font-bold text-slate-600 mr-1">
                درجات الطلاب ({students.length})
              </span>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSetAllMarks(maxMarks)}
                className="text-[11px] font-bold text-amber-700 hover:bg-amber-100 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                تحديد الدرجة النهائية للكل
              </button>
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
                قم بإضافة طلاب أولاً لإمكانية رصد درجات الامتحان.
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 pl-1 scrollbar-thin">
              {students.map((student, idx) => (
                <ExamStudentMarkRow
                  key={student._id}
                  student={student}
                  index={idx}
                  markValue={marksMap[student._id] ?? ""}
                  maxMarks={parseFloat(maxMarks) || 0}
                  disabled={isSubmitting}
                  onMarkChange={handleMarkChange}
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
              className="px-6 py-2.5 bg-[#e1b54d] hover:bg-[#cca341] text-white font-bold rounded-xl text-xs shadow-md shadow-[#e1b54d]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
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
                "حفظ الامتحان"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
