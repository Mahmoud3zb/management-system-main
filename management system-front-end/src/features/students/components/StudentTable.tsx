import React from "react";
import { getStudentId, isPaymentRecordPaid } from "../../payments";
import type { User, AttendanceSheet, Payment } from "../../../types";

interface StudentTableProps {
  students: User[];
  isLoading: boolean;
  searchQuery: string;
  attendanceSheets?: AttendanceSheet[];
  paymentSheets?: Payment[];
  viewMode?: "attendance" | "payments";
  onEdit: (student: User) => void;
  onDelete: (student: User) => void;
  onOpenAddModal: () => void;
}

const ARABIC_MONTHS: Record<string, string> = {
  "01": "يناير",
  "02": "فبراير",
  "03": "مارس",
  "04": "أبريل",
  "05": "مايو",
  "06": "يونيو",
  "07": "يوليو",
  "08": "أغسطس",
  "09": "سبتمبر",
  "10": "أكتوبر",
  "11": "نوفمبر",
  "12": "ديسمبر",
};

const formatArabicMonth = (monthStr: string): string => {
  if (!monthStr) return "";
  const parts = monthStr.split("-");
  if (parts.length === 2) {
    const year = parts[0];
    const monthNum = parts[1].padStart(2, "0");
    const monthName = ARABIC_MONTHS[monthNum] || monthNum;
    return `${monthName} ${year}`;
  }
  return monthStr;
};

const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    return `${day}/${month}`;
  }
  return dateStr;
};

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  isLoading,
  searchQuery,
  attendanceSheets = [],
  paymentSheets = [],
  viewMode = "attendance",
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 animate-pulse space-y-3">
        <div className="h-6 bg-slate-100 rounded-full w-full"></div>
        <div className="h-6 bg-slate-100 rounded-full w-full"></div>
        <div className="h-6 bg-slate-100 rounded-full w-full"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center my-4 shadow-xs" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-300">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-slate-800">
          {searchQuery.trim() ? "لا توجد نتائج مطابقة للبحث" : "لا يوجد طلاب في هذه المجموعة حتى الآن"}
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1 mb-5">
          {searchQuery.trim()
            ? `لم يتم العثور على طالب يطابق "${searchQuery}"`
            : "اضغط على زر إدخال طالب لإضافة الطلاب لهذه المجموعة."}
        </p>
        {!searchQuery.trim() && (
          <button
            onClick={onOpenAddModal}
            className="bg-[#367ab8] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md hover:bg-[#2d679c] transition-all cursor-pointer"
          >
            + إضافة طالب الآن
          </button>
        )}
      </div>
    );
  }

  // Attendance Sheets (Reverse to match reverse order)
  const displayedAttendanceSheets = [...attendanceSheets].reverse();

  // Payment Sheets (Sorted chronologically oldest to newest)
  const sortedPaymentSheets = [...paymentSheets].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs" dir="rtl">
      {/* Zero State Banners */}
      {viewMode === "attendance" && displayedAttendanceSheets.length === 0 && (
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-2.5 text-slate-400 text-[11px] font-bold flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>لم يتم تسجيل أي حصص حضور لهذه المجموعة حتى الآن</span>
        </div>
      )}

      {viewMode === "payments" && sortedPaymentSheets.length === 0 && (
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-2.5 text-slate-400 text-[11px] font-bold flex items-center gap-2">
          <svg className="w-4 h-4 text-[#4F8A70] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>لم يتم تسجيل أي مدفوعات لهذه المجموعة حتى الآن</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs border-collapse">
          <thead className="bg-slate-50/90 border-b border-slate-100 text-slate-500 font-bold">
            <tr>
              <th className="py-3.5 px-4 text-center w-12 shrink-0">#</th>

              {/* Sticky Student Name & Phone Header */}
              <th className="py-3.5 px-4 sticky right-0 bg-slate-50 z-10 border-l border-slate-100/60 min-w-[190px]">
                اسم الطالب / رقم الهاتف
              </th>

              {/* Attendance Columns */}
              {viewMode === "attendance" &&
                displayedAttendanceSheets.map((sheet) => (
                  <th
                    key={sheet._id}
                    className="py-3.5 px-3 text-center min-w-[55px] font-extrabold text-[#ce5071] border-l border-slate-100/60"
                    title={`حصة يوم ${sheet.date}`}
                  >
                    <span className="bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-lg text-[11px] inline-block">
                      {formatShortDate(sheet.date)}
                    </span>
                  </th>
                ))}

              {/* Payments Columns */}
              {viewMode === "payments" &&
                sortedPaymentSheets.map((sheet) => (
                  <th
                    key={sheet._id}
                    className="py-3.5 px-3 text-center min-w-[90px] font-extrabold text-[#4F8A70] border-l border-slate-100/60"
                    title={`كشف شهر ${sheet.month}`}
                  >
                    <span className="bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg text-[11px] inline-block">
                      {formatArabicMonth(sheet.month)}
                    </span>
                  </th>
                ))}

              {/* Summary Column */}
              {viewMode === "attendance" && displayedAttendanceSheets.length > 0 && (
                <th className="py-3.5 px-3 text-center min-w-[90px] border-l border-slate-100/60 text-slate-600 font-bold">
                  ملخص الحضور
                </th>
              )}

              {viewMode === "payments" && sortedPaymentSheets.length > 0 && (
                <th className="py-3.5 px-3 text-center min-w-[110px] border-l border-slate-100/60 text-slate-600 font-bold">
                  ملخص المدفوعات
                </th>
              )}

              <th className="py-3.5 px-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {students.map((student, index) => {
              // Attendance Calculations
              let studentPresentCount = 0;
              let studentAbsentCount = 0;
              let hasAttendanceRecords = false;

              if (viewMode === "attendance") {
                displayedAttendanceSheets.forEach((sheet) => {
                  const rec = (sheet.present || []).find((p) => {
                    const sId = getStudentId(p.studentID);
                    return sId === student._id;
                  });

                  if (rec) {
                    hasAttendanceRecords = true;
                    if (rec.isPresent) studentPresentCount++;
                    else studentAbsentCount++;
                  }
                });
              }

              // Payments Calculations
              let studentPaidMonthsCount = 0;
              let studentUnpaidMonthsCount = 0;
              let hasPaymentRecords = false;

              if (viewMode === "payments") {
                sortedPaymentSheets.forEach((sheet) => {
                  const paidList = sheet.paidList || [];
                  const rec = paidList.find((p) => {
                    const sId = getStudentId(p.studentID);
                    return sId === student._id;
                  });

                  if (rec !== undefined) {
                    hasPaymentRecords = true;
                    const isRecPaid = isPaymentRecordPaid(rec);
                    if (isRecPaid) studentPaidMonthsCount++;
                    else studentUnpaidMonthsCount++;
                  }
                });
              }

              return (
                <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400 w-12">{index + 1}</td>

                  {/* Sticky Student Name & Phone Cell */}
                  <td className="py-3.5 px-4 sticky right-0 bg-white z-10 border-l border-slate-100/60">
                    <div className="font-extrabold text-slate-900 text-sm">{student.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 dir-ltr text-right mt-0.5">
                      {student.phone || "-"}
                    </div>
                  </td>

                  {/* Attendance Cells */}
                  {viewMode === "attendance" &&
                    displayedAttendanceSheets.map((sheet) => {
                      const record = (sheet.present || []).find((p) => {
                        const sId = getStudentId(p.studentID);
                        return sId === student._id;
                      });

                      return (
                        <td key={sheet._id} className="py-3.5 px-2 text-center border-l border-slate-100/60">
                          {record === undefined ? (
                            <span className="text-slate-300 font-bold text-xs">—</span>
                          ) : record.isPresent ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-xs">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-extrabold text-xs">
                              ✕
                            </span>
                          )}
                        </td>
                      );
                    })}

                  {/* Payments Cells */}
                  {viewMode === "payments" &&
                    sortedPaymentSheets.map((sheet) => {
                      const paidList = sheet.paidList || [];
                      const record = paidList.find((p) => {
                        const sId = getStudentId(p.studentID);
                        return sId === student._id;
                      });

                      const isRecPaid = record ? isPaymentRecordPaid(record) : false;

                      return (
                        <td key={sheet._id} className="py-3.5 px-2 text-center border-l border-slate-100/60">
                          {record === undefined ? (
                            <span className="text-slate-300 font-bold text-xs">—</span>
                          ) : isRecPaid ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg inline-block">
                              مدفوع
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg inline-block">
                              غير مدفوع
                            </span>
                          )}
                        </td>
                      );
                    })}

                  {/* Attendance Summary */}
                  {viewMode === "attendance" && displayedAttendanceSheets.length > 0 && (
                    <td className="py-3.5 px-2 text-center border-l border-slate-100/60">
                      {hasAttendanceRecords ? (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-[11px] font-extrabold text-slate-700">
                          <span className="text-emerald-700">✓ {studentPresentCount}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-rose-600">✕ {studentAbsentCount}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">—</span>
                      )}
                    </td>
                  )}

                  {/* Payments Summary */}
                  {viewMode === "payments" && sortedPaymentSheets.length > 0 && (
                    <td className="py-3.5 px-2 text-center border-l border-slate-100/60">
                      {hasPaymentRecords ? (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-[11px] font-extrabold text-slate-700">
                          <span className="text-emerald-700">مدفوع {studentPaidMonthsCount}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-rose-600">غير مدفوع {studentUnpaidMonthsCount}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">—</span>
                      )}
                    </td>
                  )}

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(student)}
                        className="p-1.5 text-slate-400 hover:text-[#367ab8] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="تعديل الطالب"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => onDelete(student)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف الطالب"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
