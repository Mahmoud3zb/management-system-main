import React from "react";
import type { AcademicLevel } from "../../../types";
import { formatArabicDate } from "./AttendanceSheetCard";

interface AttendanceDetailsHeaderProps {
  groupName: string;
  groupLevel?: AcademicLevel;
  date: string;
  totalStudents: number;
  onBack: () => void;
}

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

export const AttendanceDetailsHeader: React.FC<AttendanceDetailsHeaderProps> = ({
  groupName,
  groupLevel,
  date,
  totalStudents,
  onBack,
}) => {
  const formattedDate = formatArabicDate(date);
  const levelText = groupLevel ? LEVEL_LABELS[groupLevel] || groupLevel : "";

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 text-right" dir="rtl">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
            title="العودة لكشوف الغياب"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span>العودة لكشوف الغياب</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-6 bg-[#ce5071] rounded-full"></span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {groupName}
          </h1>
          {levelText && (
            <span className="bg-blue-50 text-[#367ab8] border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full mr-1">
              {levelText}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 font-extrabold mr-3.5 mt-1">
          كشف حضور يوم {formattedDate || date} ({totalStudents} طالب)
        </p>
      </div>
    </div>
  );
};
