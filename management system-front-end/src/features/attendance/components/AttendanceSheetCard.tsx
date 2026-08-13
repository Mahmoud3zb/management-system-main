import React from "react";
import type { AttendanceSheet } from "../../../types";

interface AttendanceSheetCardProps {
  sheet: AttendanceSheet;
  onViewDetails: (sheetId: string) => void;
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

export const AttendanceSheetCard: React.FC<AttendanceSheetCardProps> = ({
  sheet,
  onViewDetails,
}) => {
  const records = sheet.present || [];
  const presentCount = records.filter((r) => r.isPresent === true).length;
  const absentCount = records.filter((r) => r.isPresent === false).length;
  const formattedDate = formatArabicDate(sheet.date);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group text-right" dir="rtl">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-bold text-[#ce5071] bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            كشف غياب
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {sheet.date}
          </span>
        </div>

        <h3 className="text-base font-black text-slate-900 leading-snug mb-4">
          {formattedDate || sheet.date}
        </h3>


        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-emerald-700 block">حاضر</span>
            <span className="text-lg font-black text-emerald-800">{presentCount}</span>
          </div>

          <div className="bg-rose-50/80 border border-rose-100 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-rose-700 block">غائب</span>
            <span className="text-lg font-black text-rose-800">{absentCount}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
        <button
          onClick={() => onViewDetails(sheet._id)}
          className="w-full bg-[#ce5071] hover:bg-[#b84361] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>عرض الكشف</span>
          <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
