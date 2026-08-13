import React from "react";

interface AttendanceSummaryProps {
  presentCount: number;
  absentCount: number;
  totalStudents: number;
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({
  presentCount,
  absentCount,
  totalStudents,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right" dir="rtl">
      <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-emerald-700 block mb-1">الطلاب الحاضرون</span>
          <span className="text-2xl font-black text-emerald-900">{presentCount}</span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="bg-rose-50/90 border border-rose-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-rose-700 block mb-1">الطلاب الغائبون</span>
          <span className="text-2xl font-black text-rose-900">{absentCount}</span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-slate-600 block mb-1">إجمالي الطلاب بالقائمة</span>
          <span className="text-2xl font-black text-slate-900">{totalStudents}</span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-slate-200/80 flex items-center justify-center text-slate-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
