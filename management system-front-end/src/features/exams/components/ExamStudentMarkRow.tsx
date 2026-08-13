import React from "react";
import type { User } from "../../../types";

interface ExamStudentMarkRowProps {
  student: User;
  index: number;
  markValue: string;
  maxMarks: number;
  disabled: boolean;
  onMarkChange: (studentId: string, value: string) => void;
}

export const ExamStudentMarkRow: React.FC<ExamStudentMarkRowProps> = ({
  student,
  index,
  markValue,
  maxMarks,
  disabled,
  onMarkChange,
}) => {
  const numMark = parseFloat(markValue);
  const isInvalid =
    markValue.trim() !== "" &&
    (isNaN(numMark) || numMark < 0 || numMark > maxMarks);

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
        isInvalid
          ? "bg-rose-50/70 border-rose-300"
          : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-6 h-6 rounded-full bg-slate-200/80 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="min-w-0">
          <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
            {student.name}
          </div>
          <div className="text-[11px] font-mono text-slate-400 dir-ltr text-right">
            {student.phone || "-"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <input
            type="number"
            min="0"
            max={maxMarks}
            step="0.5"
            disabled={disabled}
            value={markValue}
            onChange={(e) => onMarkChange(student._id, e.target.value)}
            placeholder="0"
            className={`w-20 sm:w-24 text-center px-3 py-1.5 border rounded-xl text-xs sm:text-sm font-extrabold dir-ltr transition-all focus:outline-none focus:ring-2 ${
              isInvalid
                ? "border-rose-500 text-rose-700 bg-white focus:ring-rose-200"
                : "border-slate-300 text-slate-900 bg-white focus:border-[#e1b54d] focus:ring-amber-100"
            } disabled:bg-slate-100 disabled:text-slate-400`}
          />
        </div>
        <span className="text-xs font-bold text-slate-400">/ {maxMarks || 0}</span>
      </div>
    </div>
  );
};
