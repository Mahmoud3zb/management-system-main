import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getGroupByIdApi } from "../features/groups/api";
import { getGroupExamsApi } from "../features/exams/api";
import {
  ExamHeaderCard,
  ExamHistoryList,
  ExamPagination,
  CreateExamModal,
} from "../features/exams/components";
import { ROUTES } from "../routes/paths";
import type { Group, Exam } from "../types";
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
    return "المجموعة أو بيانات الامتحانات غير موجودة.";
  }
  return apiErr?.message && apiErr.message !== "Unauthorized"
    ? apiErr.message
    : fallback;
};

export const ExamsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const groupId = searchParams.get("groupId");

  const [group, setGroup] = useState<Group | null>(null);
  const [isGroupLoading, setIsGroupLoading] = useState(false);

  const [exams, setExams] = useState<Exam[]>([]);
  const [isExamsLoading, setIsExamsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExams, setTotalExams] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [groupId]);

  useEffect(() => {
    let isMounted = true;

    if (!groupId) {
      setGroup(null);
      setExams([]);
      setIsGroupLoading(false);
      return;
    }

    const loadTargetGroup = async () => {
      setIsGroupLoading(true);
      setError(null);

      try {
        const groupRes = await getGroupByIdApi(groupId);
        if (isMounted) {
          setGroup(groupRes.data || null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(getArabicErrorMessage(err, "تعذر تحميل بيانات المجموعة."));
        }
      } finally {
        if (isMounted) setIsGroupLoading(false);
      }
    };

    loadTargetGroup();

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  const fetchExamsHistory = useCallback(async () => {
    if (!groupId || !group?._id) return;

    setIsExamsLoading(true);

    try {
      const response = await getGroupExamsApi(group._id, {
        page,
        limit: 10,
      });

      setExams(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalExams(response.total || 0);
    } catch (err: any) {
      setError(getArabicErrorMessage(err, "حدث خطأ أثناء تحميل سجل الامتحانات."));
    } finally {
      setIsExamsLoading(false);
    }
  }, [groupId, group?._id, page]);

  useEffect(() => {
    fetchExamsHistory();
  }, [fetchExamsHistory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleViewDetails = (examId: string) => {
    if (groupId) {
      navigate(`/exams/${examId}?groupId=${groupId}`);
    } else {
      navigate(`/exams/${examId}`);
    }
  };

  if (!groupId) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center my-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-[#e1b54d]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">
            اختر مجموعة أولاً لعرض امتحاناتها
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mb-6 leading-relaxed">
            متابعة امتحانات الطلاب ورصد درجاتهم تتم من خلال اختيار المجموعة الدراسية أولاً من قائمة المجموعات.
          </p>
          <button
            onClick={() => navigate(ROUTES.GROUPS)}
            className="bg-[#367ab8] hover:bg-[#2d679c] text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md shadow-[#367ab8]/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>الانتقال لصفحة المجموعات</span>
            <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#e1b54d] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-extrabold animate-bounce">
          <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      <ExamHeaderCard
        group={group}
        totalExams={totalExams}
        isLoading={isGroupLoading}
        onOpenCreateExamModal={() => setIsCreateExamModalOpen(true)}
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>

          {error.includes("انتهت جلسة العمل") && (
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-rose-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      )}

      <ExamHistoryList
        exams={exams}
        groupId={groupId}
        isLoading={isExamsLoading || isGroupLoading}
        onViewDetails={handleViewDetails}
        onOpenCreateExamModal={() => setIsCreateExamModalOpen(true)}
      />

      <ExamPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <CreateExamModal
        isOpen={isCreateExamModalOpen}
        groupId={groupId}
        groupName={group?.name || ""}
        onSuccess={(msg) => {
          showToast(msg);
          fetchExamsHistory();
        }}
        onClose={() => setIsCreateExamModalOpen(false)}
      />
    </div>
  );
};
