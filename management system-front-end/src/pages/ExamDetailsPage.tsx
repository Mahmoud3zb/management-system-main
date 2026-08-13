import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getExamByIdApi, deleteExamApi } from "../features/exams/api";
import { getGroupByIdApi, getGroupStudentsApi } from "../features/groups/api";
import {
  ExamDetailsHeader,
  ExamResultsSummary,
  ExamResultsTable,
  EditExamModal,
  EditStudentMarkModal,
  ArchiveExamModal,
  type StudentMarkItemTarget,
} from "../features/exams/components";
import { ROUTES } from "../routes/paths";
import type { Exam, Group, User } from "../types";
import type { ApiErrorResponse } from "../services/apiClient";

export const ExamDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const groupIdParam = searchParams.get("groupId");

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const [targetStudentForEdit, setTargetStudentForEdit] =
    useState<StudentMarkItemTarget | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchExamDetails = useCallback(async () => {
    if (!id) {
      setError("معرف الامتحان غير صالح.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getExamByIdApi(id);
      const rawData = response.data;
      let examObj: Exam | null = null;
      if (Array.isArray(rawData)) {
        examObj = rawData.length > 0 ? rawData[0] : null;
      } else if (rawData && typeof rawData === "object") {
        examObj = rawData as Exam;
      }

      if (!examObj) {
        setError("الامتحان غير موجود.");
        setIsLoading(false);
        return;
      }

      const groupIDStr =
        typeof examObj.groupID === "object"
          ? (examObj.groupID as Group)._id
          : (examObj.groupID as string) || groupIdParam || "";

      let groupData: Group | null =
        typeof examObj.groupID === "object" ? (examObj.groupID as Group) : null;
      let studentsList: User[] = [];

      if (groupIDStr) {
        if (!groupData) {
          try {
            const groupRes = await getGroupByIdApi(groupIDStr);
            groupData = groupRes.data || null;
          } catch (gErr) {
            console.error("Fetch group info error:", gErr);
          }
        }

        try {
          const studentsRes = await getGroupStudentsApi(groupIDStr);
          studentsList = studentsRes.data || [];
        } catch (sErr) {
          console.error("Fetch students roster error:", sErr);
        }
      }

      const studentMap: Record<string, User> = {};
      studentsList.forEach((s) => {
        studentMap[s._id] = s;
      });

      const enrichedResults = (examObj.results || []).map((r) => {
        if (typeof r.studentID === "string") {
          const matchedStudent = studentMap[r.studentID];
          return {
            ...r,
            studentID: matchedStudent || {
              _id: r.studentID,
              name: "طالب غير معروف",
              phone: "-",
            },
          };
        }
        return r;
      });

      const finalExam: Exam = {
        ...examObj,
        groupID: groupData || examObj.groupID,
        results: enrichedResults,
      };

      setExam(finalExam);
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr?.status === 401) {
        setError("انتهت جلسة العمل أو غير مصرح، يرجى إعادة تسجيل الدخول.");
      } else if (apiErr?.status === 404) {
        setError("الامتحان غير موجود.");
      } else {
        setError(apiErr?.message || "حدث خطأ أثناء تحميل بيانات الامتحان.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, groupIdParam]);

  useEffect(() => {
    fetchExamDetails();
  }, [fetchExamDetails]);

  const handleBack = () => {
    if (groupIdParam) {
      navigate(`${ROUTES.EXAMS}?groupId=${groupIdParam}`);
    } else {
      navigate(ROUTES.EXAMS);
    }
  };

  // Archive / Delete flow
  const handleConfirmArchive = async () => {
    if (!exam) return;
    setIsArchiving(true);
    try {
      await deleteExamApi(exam._id);
      setIsArchiveModalOpen(false);
      triggerToast("تم أرشفة الامتحان بنجاح");
      const targetGroupId =
        groupIdParam ||
        (typeof exam.groupID === "object" ? (exam.groupID as Group)._id : exam.groupID);
      setTimeout(() => {
        if (targetGroupId) {
          navigate(`${ROUTES.EXAMS}?groupId=${targetGroupId}`);
        } else {
          navigate(ROUTES.EXAMS);
        }
      }, 500);
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      setError(apiErr?.message || "حدث خطأ أثناء أرشفة الامتحان، حاول مرة أخرى.");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleEditExamSuccess = (message: string) => {
    triggerToast(message);
    fetchExamDetails();
  };

  const handleEditStudentMarkSuccess = (message: string) => {
    triggerToast(message);
    fetchExamDetails();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded-full w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded-full w-1/4"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-3xl text-sm font-medium flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error || "الامتحان غير موجود."}</span>
          </div>

          <button
            onClick={handleBack}
            className="bg-white text-rose-700 border border-rose-300 hover:bg-rose-100 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shrink-0"
          >
            العودة للامتحانات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Deleted / Archived Banner */}
      {exam.isDeleted && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>هذا الامتحان مؤرشف في النظام.</span>
        </div>
      )}

      {/* Header with edit & archive buttons */}
      <ExamDetailsHeader
        exam={exam}
        groupIdParam={groupIdParam}
        onOpenEditModal={() => setIsEditExamModalOpen(true)}
        onOpenArchiveModal={() => setIsArchiveModalOpen(true)}
      />

      {/* Summary stats */}
      <ExamResultsSummary exam={exam} />

      {/* Results table with edit mark buttons */}
      <ExamResultsTable
        exam={exam}
        onEditMark={(studentTarget) => setTargetStudentForEdit(studentTarget)}
      />

      {/* Modals */}
      <EditExamModal
        isOpen={isEditExamModalOpen}
        exam={exam}
        onClose={() => setIsEditExamModalOpen(false)}
        onSuccess={handleEditExamSuccess}
      />

      <EditStudentMarkModal
        isOpen={Boolean(targetStudentForEdit)}
        examId={exam._id}
        maxMarks={exam.maxMarks}
        targetStudent={targetStudentForEdit}
        onClose={() => setTargetStudentForEdit(null)}
        onSuccess={handleEditStudentMarkSuccess}
      />

      <ArchiveExamModal
        isOpen={isArchiveModalOpen}
        examTitle={exam.title}
        isSubmitting={isArchiving}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleConfirmArchive}
      />
    </div>
  );
};
