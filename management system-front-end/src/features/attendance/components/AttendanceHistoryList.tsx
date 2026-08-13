import React from "react";
import { AttendanceSheetCard } from "./AttendanceSheetCard";
import type { AttendanceSheet } from "../../../types";

interface AttendanceHistoryListProps {
  sheets: AttendanceSheet[];
  isLoading: boolean;
  onViewDetails: (sheetId: string) => void;
  onOpenTakeAttendanceModal: () => void;
}

export const AttendanceHistoryList: React.FC<AttendanceHistoryListProps> = ({
  sheets,
  isLoading,
  onViewDetails,
  onOpenTakeAttendanceModal,
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

  if (sheets.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center my-6 shadow-xs text-right" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-[#ce5071]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-slate-800">
          لا توجد سجلات حضور لهذه المجموعة حتى الآن
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1 mb-6">
          يمكنك بدء تسجيل أول حصة دراسية لهذه المجموعة الآن.
        </p>
        <button
          onClick={onOpenTakeAttendanceModal}
          className="bg-[#ce5071] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-[#ce5071]/20 hover:bg-[#b84361] transition-all cursor-pointer"
        >
          تسجيل أول حصة
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {sheets.map((sheet) => (
        <AttendanceSheetCard
          key={sheet._id}
          sheet={sheet}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
