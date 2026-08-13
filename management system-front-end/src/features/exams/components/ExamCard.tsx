import React from "react";
import type { Exam } from "../../../types";

interface ExamCardProps {
  exam: Exam;
  groupId: string;
  onViewDetails: (examId: string) => void;
}

export const formatArabicDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onViewDetails,
}) => {
  const formattedDate = formatArabicDate(exam.date);
  const studentResultsCount = exam.results ? exam.results.length : 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group text-right" dir="rtl">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-bold text-[#b58f33] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            اختبار
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {exam.date}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-3">
          {exam.title}
        </h3>

        <p className="text-xs font-medium text-slate-500 mb-5">
          {formattedDate || exam.date}
        </p>


        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-amber-700 block mb-0.5">الدرجة النهائية</span>
            <span className="text-lg font-black text-amber-900">{exam.maxMarks}</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">عدد الطلاب</span>
            <span className="text-lg font-black text-slate-800">{studentResultsCount}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
        <button
          onClick={() => onViewDetails(exam._id)}
          className="w-full bg-[#e1b54d] hover:bg-[#cca341] active:bg-[#b58f33] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-[#e1b54d]/20"
        >
          <span>عرض الامتحان</span>
          <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
