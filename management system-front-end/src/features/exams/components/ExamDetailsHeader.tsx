import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/paths";
import type { Exam, Group, AcademicLevel } from "../../../types";

interface ExamDetailsHeaderProps {
  exam: Exam;
  groupIdParam: string | null;
  onOpenEditModal?: () => void;
  onOpenArchiveModal?: () => void;
}

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

const formatArabicDate = (dateStr: string): string => {
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
  } catch {
    return dateStr;
  }
};

export const ExamDetailsHeader: React.FC<ExamDetailsHeaderProps> = ({
  exam,
  groupIdParam,
  onOpenEditModal,
  onOpenArchiveModal,
}) => {
  const navigate = useNavigate();

  const groupObj = typeof exam.groupID === "object" ? (exam.groupID as Group) : null;
  const groupName = groupObj?.name || "";
  const groupLevel = groupObj?.level ? LEVEL_LABELS[groupObj.level as AcademicLevel] || groupObj.level : "";

  const handleBack = () => {
    const targetGroupId = groupIdParam || (groupObj ? groupObj._id : null);
    if (targetGroupId) {
      navigate(`${ROUTES.EXAMS}?groupId=${targetGroupId}`);
    } else {
      navigate(ROUTES.EXAMS);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handleBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="العودة لقائمة الامتحانات"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#e1b54d] rounded-full"></span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {exam.title}
                </h1>
                {exam.isDeleted && (
                  <span className="bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    مؤرشف
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 mr-1">
            {groupName && (
              <span className="bg-blue-50 text-[#367ab8] border border-blue-200 px-3 py-1 rounded-full">
                مجموعة: {groupName}
              </span>
            )}

            {groupLevel && (
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                {groupLevel}
              </span>
            )}

            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
              تاريخ الامتحان: {formatArabicDate(exam.date) || exam.date}
            </span>
          </div>
        </div>

        {/* Right side actions & badge */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {!exam.isDeleted && (
            <div className="flex items-center gap-2">
              {onOpenEditModal && (
                <button
                  onClick={onOpenEditModal}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>تعديل الامتحان</span>
                </button>
              )}

              {onOpenArchiveModal && (
                <button
                  onClick={onOpenArchiveModal}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>أرشفة الامتحان</span>
                </button>
              )}
            </div>
          )}

          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 text-center shrink-0 min-w-[120px]">
            <span className="text-[11px] font-extrabold text-amber-800 block mb-0.5">الدرجة النهائية</span>
            <span className="text-xl font-black text-amber-950">{exam.maxMarks}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
