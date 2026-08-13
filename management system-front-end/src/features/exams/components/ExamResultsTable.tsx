import React from "react";
import type { Exam, User } from "../../../types";
import type { StudentMarkItemTarget } from "./EditStudentMarkModal";

interface ExamResultsTableProps {
  exam: Exam;
  onEditMark?: (studentTarget: StudentMarkItemTarget) => void;
}

export const ExamResultsTable: React.FC<ExamResultsTableProps> = ({
  exam,
  onEditMark,
}) => {
  const results = exam.results || [];
  const maxMarks = exam.maxMarks || 100;

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
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs text-right" dir="rtl">
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
            {results.map((result, index) => {
              const studentObj = typeof result.studentID === "object" ? (result.studentID as User) : null;
              const studentIDStr = studentObj ? studentObj._id : (result.studentID as string);
              const studentName = studentObj ? studentObj.name : "طالب غير معروف";
              const studentPhone = studentObj ? studentObj.phone || "-" : "-";

              const marks = result.marks ?? 0;
              const percentage = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;

              let gradeBadgeClass = "bg-rose-100 text-rose-800";
              let gradeText = "ضعيف";

              if (percentage >= 85) {
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
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400 w-12">{index + 1}</td>

                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                    {studentName}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-slate-500 dir-ltr">
                    {studentPhone}
                  </td>

                  <td className="py-3.5 px-4 text-center font-black text-amber-900 text-sm">
                    {marks}
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                    {maxMarks}
                  </td>

                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-700">
                    {percentage.toFixed(1)}%
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
                        تعديل الدرجة
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
  );
};
