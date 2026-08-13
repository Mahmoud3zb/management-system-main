import React from "react";
import type { AttendanceRecord, User } from "../../../types";

interface AttendanceDetailsTableProps {
  records: AttendanceRecord[];
}

export const AttendanceDetailsTable: React.FC<AttendanceDetailsTableProps> = ({
  records,
}) => {
  if (records.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center my-6 shadow-xs text-right" dir="rtl">
        <p className="text-sm font-extrabold text-slate-700">لا توجد بيانات حضور في هذا الكشف.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs text-right" dir="rtl">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900">كشف أسماء الطلاب بالحصة</h3>
        <span className="text-xs font-bold text-slate-400">{records.length} طالب</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">اسم الطالب ورقم الهاتف</th>
              <th className="px-6 py-4 text-center">حالة الحضور</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {records.map((record, index) => {
              const studentObj = typeof record.studentID === "object" ? (record.studentID as User) : null;
              const studentName = studentObj?.name || (typeof record.studentID === "string" ? record.studentID : "طالب غير معروف");
              const studentPhone = studentObj?.phone || "-";
              const isPresent = record.isPresent === true;

              return (
                <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{studentName}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5" dir="ltr text-right">{studentPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isPresent ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        حاضر
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-extrabold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        غائب
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
