import React from "react";
import { ExamCard } from "./ExamCard";
import type { Exam } from "../../../types";

interface ExamHistoryListProps {
  exams: Exam[];
  groupId: string;
  isLoading: boolean;
  onViewDetails: (examId: string) => void;
  onOpenCreateExamModal?: () => void;
}

export const ExamHistoryList: React.FC<ExamHistoryListProps> = ({
  exams,
  groupId,
  isLoading,
  onViewDetails,
  onOpenCreateExamModal,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="h-5 bg-slate-100 rounded-full w-2/3"></div>
            <div className="h-12 bg-slate-100 rounded-2xl w-full"></div>
            <div className="h-10 bg-slate-100 rounded-xl w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center my-6 shadow-xs text-right" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-[#e1b54d]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-slate-800 mb-1">
          لا توجد امتحانات مسجلة لهذه المجموعة حتى الآن
        </h3>
        <p className="text-xs text-slate-400 font-medium max-w-md mx-auto mb-6">
          سيظهر هنا سجل الامتحانات ونتائج الطلاب عند إضافة أول امتحان لهذه المجموعة.
        </p>

        {onOpenCreateExamModal && (
          <button
            onClick={onOpenCreateExamModal}
            className="bg-[#e1b54d] hover:bg-[#cca341] active:bg-[#b58f33] text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md shadow-[#e1b54d]/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>تسجيل أول امتحان الآن</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {exams.map((exam) => (
        <ExamCard
          key={exam._id}
          exam={exam}
          groupId={groupId}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
