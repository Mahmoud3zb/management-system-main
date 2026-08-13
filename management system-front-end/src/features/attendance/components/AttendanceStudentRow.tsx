import React from "react";
import type { User } from "../../../types";

interface AttendanceStudentRowProps {
  student: User;
  isPresent: boolean;
  onToggle: (studentId: string, isPresent: boolean) => void;
}

export const AttendanceStudentRow: React.FC<AttendanceStudentRowProps> = ({
  student,
  isPresent,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl transition-all hover:bg-white text-right" dir="rtl">
      <div>
        <h4 className="text-xs font-extrabold text-slate-900">{student.name}</h4>
        <p className="text-[11px] font-medium text-slate-500 font-mono text-right mt-0.5" dir="ltr">{student.phone}</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onToggle(student._id, true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            isPresent
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-slate-200/70 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>حاضر</span>
        </button>

        <button
          type="button"
          onClick={() => onToggle(student._id, false)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            !isPresent
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-slate-200/70 text-slate-600 hover:bg-rose-100 hover:text-rose-700"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>غائب</span>
        </button>
      </div>
    </div>
  );
};
