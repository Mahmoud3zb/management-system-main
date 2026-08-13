import React from "react";
import type { Exam } from "../../../types";

interface ExamResultsSummaryProps {
  exam: Exam;
}

export const ExamResultsSummary: React.FC<ExamResultsSummaryProps> = ({ exam }) => {
  const results = exam.results || [];
  const totalStudents = results.length;
  const maxMarks = exam.maxMarks || 100;

  if (totalStudents === 0) return null;

  const marksList = results.map((r) => r.marks);
  const sumMarks = marksList.reduce((acc, curr) => acc + curr, 0);
  const averageMarks = sumMarks / totalStudents;
  const highestMark = Math.max(...marksList);
  const lowestMark = Math.min(...marksList);
  const averagePercentage = maxMarks > 0 ? (averageMarks / maxMarks) * 100 : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-right" dir="rtl">

      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <span className="text-xs font-extrabold text-slate-400 block mb-1">إجمالي الطلاب</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-slate-900">{totalStudents}</span>
          <span className="text-xs font-bold text-slate-500">طالب</span>
        </div>
      </div>


      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <span className="text-xs font-extrabold text-slate-400 block mb-1">متوسط الدرجات</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-amber-700">{averageMarks.toFixed(1)}</span>
          <span className="text-xs font-bold text-slate-400">/ {maxMarks} ({averagePercentage.toFixed(1)}%)</span>
        </div>
      </div>


      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <span className="text-xs font-extrabold text-slate-400 block mb-1">أعلى درجة</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-emerald-700">{highestMark}</span>
          <span className="text-xs font-bold text-slate-400">/ {maxMarks}</span>
        </div>
      </div>


      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <span className="text-xs font-extrabold text-slate-400 block mb-1">أقل درجة</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-rose-700">{lowestMark}</span>
          <span className="text-xs font-bold text-slate-400">/ {maxMarks}</span>
        </div>
      </div>
    </div>
  );
};
