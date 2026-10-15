import React, { useState, useEffect, useMemo } from "react";
import { getGroupStudentsApi } from "../../groups/api";
import { updateStudentMarkApi } from "../api";
import { ExamStudentMarkRow } from "./ExamStudentMarkRow";
import type { User, Exam } from "../../../types";
import type { ApiErrorResponse } from "../../../services/apiClient";
import { matchesSearch } from "../../../utils";

interface ExamGradingModalProps {
  isOpen: boolean;
  exam: Exam | null;
  groupId: string | null;
  groupName?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Helper to safely extract string ID from populated object or string ID
 */
const getEntityId = (entity: any): string => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  if (typeof entity === "object") {
    if (entity._id) return entity._id.toString();
    if (entity.id) return entity.id.toString();
  }
  return String(entity);
};

export const ExamGradingModal: React.FC<ExamGradingModalProps> = ({
  isOpen,
  exam,
  groupId,
  groupName,
  onClose,
  onSuccess,
}) => {
  // Master list of all students to grade (current active + historical in exam)
  const [students, setStudents] = useState<User[]>([]);
  // Set of current active student IDs to distinguish historical students
  const [activeStudentIds, setActiveStudentIds] = useState<Set<string>>(new Set());
  // Marks map key: studentId, value: raw mark input string
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  // Track initial marks to detect changes and avoid unnecessary API calls
  const [initialMarksMap, setInitialMarksMap] = useState<Record<string, string>>({});

  // Quick Search Filter state
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const maxMarks = exam?.maxMarks || 100;
  const examTitle = exam?.title || "رصد درجات الامتحان";

  // Fetch Master Student List & Perform Frontend Merge with Exam Snapshot
  useEffect(() => {
    if (!isOpen || !groupId || !exam) {
      return;
    }

    let isMounted = true;
    setIsLoadingStudents(true);
    setError(null);
    setSearchTerm("");

    // Build map of existing recorded exam marks and student info
    const existingMarksMap: Record<string, string> = {};
    const existingStudentObjMap: Record<string, User> = {};
    if (exam.results && Array.isArray(exam.results)) {
      exam.results.forEach((res) => {
        const sId = getEntityId(res.studentID);
        if (sId) {
          existingMarksMap[sId] = String(res.marks ?? "");
          if (typeof res.studentID === "object" && res.studentID !== null) {
            existingStudentObjMap[sId] = res.studentID as User;
          }
        }
      });
    }

    const fetchStudentsAndMerge = async () => {
      try {
        // Fetch list of current active group students
        const response = await getGroupStudentsApi(groupId);
        if (!isMounted) return;

        const masterStudentsList = response.data || [];
        const currentIds = new Set<string>(masterStudentsList.map((s) => s._id));
        setActiveStudentIds(currentIds);

        // 1. Current active students in group
        const allStudentsToGrade: User[] = [...masterStudentsList];

        // 2. Preserve historical students in exam.results who are no longer in active roster
        if (exam.results && Array.isArray(exam.results)) {
          exam.results.forEach((res) => {
            const sId = getEntityId(res.studentID);
            if (sId && !currentIds.has(sId)) {
              currentIds.add(sId);
              const historicalStudent: User = existingStudentObjMap[sId] || ({
                _id: sId,
                name: (res as any).studentName || "طالب غير مسجل حالياً",
                phone: (res as any).studentPhone || "-",
              } as User);
              allStudentsToGrade.push(historicalStudent);
            }
          });
        }

        setStudents(allStudentsToGrade);

        // Pre-fill existing marks (including 0); late joiners receive empty string ""
        const mergedMarks: Record<string, string> = {};
        allStudentsToGrade.forEach((s) => {
          mergedMarks[s._id] = existingMarksMap[s._id] !== undefined ? existingMarksMap[s._id] : "";
        });

        setMarksMap(mergedMarks);
        setInitialMarksMap(mergedMarks);
      } catch (err: any) {
        if (isMounted) {
          const apiErr = err as ApiErrorResponse;
          setError(apiErr?.message || "تعذر تحميل قائمة طلاب المجموعة.");
        }
      } finally {
        if (isMounted) setIsLoadingStudents(false);
      }
    };

    fetchStudentsAndMerge();

    return () => {
      isMounted = false;
    };
  }, [isOpen, groupId, exam]);

  // Quick Search Filter logic using matchesSearch (with Arabic normalization)
  const filteredStudents = useMemo<User[]>(() => {
    if (!searchTerm.trim()) return students;
    return students.filter((s) =>
      matchesSearch(searchTerm, s.name, s.phone, s.parentPhone)
    );
  }, [students, searchTerm]);

  if (!isOpen || !exam) return null;

  const handleMarkChange = (studentId: string, val: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: val,
    }));
  };

  const handleSetAllMarks = (value: string) => {
    const updated: Record<string, string> = {};
    filteredStudents.forEach((s) => {
      updated[s._id] = value;
    });
    setMarksMap((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!exam) return;

    // Validate marks before submitting
    const changedUpdates: { studentID: string; studentName: string; marks: number }[] = [];

    for (const student of students) {
      const rawVal = marksMap[student._id] ?? "";
      const trimmed = rawVal.trim();

      // Only update if value is filled and changed from initial
      if (trimmed !== "") {
        const parsedMark = parseFloat(trimmed);
        if (isNaN(parsedMark)) {
          setError(`درجة الطالب (${student.name}) غير صحيحة.`);
          return;
        }
        if (parsedMark < 0) {
          setError(`درجة الطالب (${student.name}) لا يمكن أن تكون بالسالب.`);
          return;
        }
        if (parsedMark > maxMarks) {
          setError(
            `درجة الطالب (${student.name}) وهي ${parsedMark} تتجاوز الدرجة النهائية (${maxMarks}).`
          );
          return;
        }

        if (trimmed !== initialMarksMap[student._id]) {
          changedUpdates.push({
            studentID: student._id,
            studentName: student.name,
            marks: parsedMark,
          });
        }
      }
    }

    if (changedUpdates.length === 0) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute mark updates in parallel
      const updatePromises = changedUpdates.map((update) =>
        updateStudentMarkApi(exam._id, {
          studentID: update.studentID,
          marks: update.marks,
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const failedCount = results.filter((r) => r.status === "rejected").length;

      if (failedCount === 0) {
        onSuccess("تم حفظ وتحديث درجات جميع الطلاب بنجاح");
        onClose();
      } else {
        setError(`تم تحديث بعض الدرجات بنجاح وتعذر تحديث ${failedCount} درجات.`);
      }
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      setError(apiErr?.message || "حدث خطأ أثناء حفظ درجات الامتحان.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-right"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#e1b54d] rounded-full"></span>
              <h3 className="text-base font-black text-slate-900">
                رصد وتعديل درجات الامتحان
              </h3>
            </div>
            <p className="text-xs font-bold text-[#367ab8] mt-0.5 mr-3.5">
              الامتحان: {examTitle} {groupName ? `| مجموعة: ${groupName}` : ""}
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

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Quick Search Filter & Bulk Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
            
            {/* Fix 2: Quick Search Input */}
            <div className="relative w-full sm:w-72">
              <svg
                className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم الطالب أو رقم الهاتف..."
                className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#e1b54d] focus:ring-2 focus:ring-[#e1b54d]/20 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Bulk Action Button */}
            {!isLoadingStudents && filteredStudents.length > 0 && (
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-[11px] font-bold text-slate-500">
                  الطلاب المعروضين: ({filteredStudents.length} / {students.length})
                </span>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSetAllMarks(String(maxMarks))}
                  className="text-[11px] font-bold text-amber-700 hover:bg-amber-100 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  الدرجة الكلية للكل
                </button>
              </div>
            )}

          </div>

          {/* Student Marks List */}
          {isLoadingStudents ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="h-12 bg-slate-100 rounded-2xl animate-pulse w-full"></div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 border border-slate-200 border-dashed rounded-2xl text-center">
              <p className="text-xs font-extrabold text-slate-600">
                {searchTerm ? "لا يوجد طلاب مطابقين للبحث" : "لا يوجد طلاب في هذه المجموعة"}
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 pl-1 scrollbar-thin">
              {filteredStudents.map((student, idx) => {
                const isLateJoiner = !exam.results?.some(
                  (r) => getEntityId(r.studentID) === student._id
                );
                const isHistorical = !activeStudentIds.has(student._id);
                return (
                  <ExamStudentMarkRow
                    key={student._id}
                    student={student}
                    index={idx}
                    markValue={marksMap[student._id] ?? ""}
                    maxMarks={maxMarks}
                    disabled={isSubmitting}
                    isLateJoiner={isLateJoiner}
                    isHistorical={isHistorical}
                    onMarkChange={handleMarkChange}
                  />
                );
              })}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50"
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
                "حفظ جميع الدرجات"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
