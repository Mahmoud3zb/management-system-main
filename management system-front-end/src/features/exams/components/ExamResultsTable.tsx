import React, { useState, useMemo } from "react";
import type { Exam, User } from "../../../types";
import type { StudentMarkItemTarget } from "./EditStudentMarkModal";
import { matchesSearch } from "../../../utils";

interface ExamResultsTableProps {
  exam: Exam;
  onEditMark?: (studentTarget: StudentMarkItemTarget) => void;
}

export const ExamResultsTable: React.FC<ExamResultsTableProps> = ({
  exam,
  onEditMark,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const results = exam.results || [];
  const maxMarks = exam.maxMarks || 100;

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results;
    return results.filter((r) => {
      const studentObj = typeof r.studentID === "object" ? (r.studentID as User) : null;
      const name = studentObj?.name || "";
      const phone = studentObj?.phone || "";
      const parentPhone = studentObj?.parentPhone || "";
      return matchesSearch(searchTerm, name, phone, parentPhone);
    });
  }, [results, searchTerm]);

  if (results.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center my-4 shadow-xs text-right" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-3 text-[#e1b54d]">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-slate-800">
          لا توجد نتائج طلاب مسجلة لهذا الامتحان
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1">
          لم يتم رصد أي درجات للطلاب في هذا التقييم بعد.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs text-right space-y-4 p-5 sm:p-6" dir="rtl">
      {/* Table Header Controls: Title & Quick Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#e1b54d] rounded-full"></span>
          <h3 className="text-sm font-extrabold text-slate-800">
            كشف درجات الطلاب ({filteredResults.length} / {results.length})
          </h3>
        </div>

        {/* Quick Search Filter */}
        <div className="relative w-full sm:w-72">
          <svg
            className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم الطالب أو رقم الهاتف..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-8 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#e1b54d] focus:ring-2 focus:ring-[#e1b54d]/20 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              title="مسح البحث"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="p-8 border border-slate-200 border-dashed rounded-2xl text-center">
          <p className="text-xs font-extrabold text-slate-600">
            لا يوجد طلاب مطابقين للبحث "{searchTerm}"
          </p>
        </div>
      ) : (
        <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4 text-center w-12 shrink-0">#</th>
                  <th className="py-3.5 px-4">اسم الطالب</th>
                  <th className="py-3.5 px-4 text-center">رقم الهاتف</th>
                  <th className="py-3.5 px-4 text-center">الدرجة المحصلة</th>
                  <th className="py-3.5 px-4 text-center">الدرجة النهائية</th>
                  <th className="py-3.5 px-4 text-center">النسبة المئوية</th>
                  <th className="py-3.5 px-4 text-center">التقييم</th>
                  {!exam.isDeleted && onEditMark && (
                    <th className="py-3.5 px-4 text-center w-28">الإجراءات</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredResults.map((result, index) => {
                  const studentObj = typeof result.studentID === "object" ? (result.studentID as User) : null;
                  const studentIDStr = studentObj ? studentObj._id : (result.studentID as string);
                  const studentName = studentObj ? studentObj.name : "طالب غير معروف";
                  const studentPhone = studentObj ? studentObj.phone || "-" : "-";
                  const isLateJoiner = Boolean((result as any).isLateJoiner);
                  const isHistorical = Boolean((result as any).isHistorical);
                  const isUnrecorded = Boolean((result as any).isUnrecorded);

                  const marks = result.marks ?? 0;
                  const percentage = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;

                  let gradeBadgeClass = "bg-rose-100 text-rose-800";
                  let gradeText = "ضعيف";

                  if (isUnrecorded) {
                    gradeBadgeClass = "bg-slate-100 text-slate-600 border border-slate-200";
                    gradeText = "لم يُرصد بعد";
                  } else if (percentage >= 85) {
                    gradeBadgeClass = "bg-emerald-100 text-emerald-800";
                    gradeText = "ممتاز";
                  } else if (percentage >= 75) {
                    gradeBadgeClass = "bg-blue-100 text-blue-800";
                    gradeText = "جيد جداً";
                  } else if (percentage >= 50) {
                    gradeBadgeClass = "bg-amber-100 text-amber-800";
                    gradeText = "مقبول";
                  }

                  return (
                    <tr key={studentIDStr || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400 w-12">{index + 1}</td>

                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{studentName}</span>
                          {isLateJoiner && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              منضم حديثاً
                            </span>
                          )}
                          {isHistorical && (
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" title="طالب مسجل بالامتحان وغير مدرج بالقائمة الحالية للمجموعة">
                              سجل سابق
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 dir-ltr">
                        {studentPhone}
                      </td>

                      <td className="py-3.5 px-4 text-center font-black text-amber-900 text-sm">
                        {isUnrecorded ? "-" : marks}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                        {maxMarks}
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-700">
                        {isUnrecorded ? "-" : `${percentage.toFixed(1)}%`}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold ${gradeBadgeClass}`}>
                          {gradeText}
                        </span>
                      </td>

                      {!exam.isDeleted && onEditMark && (
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() =>
                              onEditMark({
                                studentID: studentIDStr,
                                studentName,
                                studentPhone,
                                currentMarks: marks,
                              })
                            }
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200 transition-colors cursor-pointer text-[11px]"
                          >
                            {isUnrecorded ? "رصد الدرجة" : "تعديل الدرجة"}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
