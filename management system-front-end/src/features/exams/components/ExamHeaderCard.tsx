import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/paths";
import type { Group, AcademicLevel } from "../../../types";

interface ExamHeaderCardProps {
  group: Group | null;
  totalExams: number;
  isLoading: boolean;
  onOpenCreateExamModal?: () => void;
}

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

export const ExamHeaderCard: React.FC<ExamHeaderCardProps> = ({
  group,
  totalExams,
  isLoading,
  onOpenCreateExamModal,
}) => {
  const navigate = useNavigate();
  const levelLabel = group ? LEVEL_LABELS[group.level as AcademicLevel] || group.level : "";

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 text-right" dir="rtl">
      <div>
        <div className="flex items-center gap-3 mb-2">
          {group && (
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(`${ROUTES.GROUPS}/${group._id}`);
                }
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
              title="العودة للصفحة السابقة"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-6 bg-[#e1b54d] rounded-full"></span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {isLoading ? "جاري التحميل..." : group ? group.name : "الامتحانات والنتائج"}
              </h1>
              {group && (
                <span className="bg-amber-50 text-[#b58f33] border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full mr-1">
                  {totalExams} امتحان
                </span>
              )}
            </div>

            {group && (
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-50 text-[#367ab8] border border-blue-200 text-xs font-bold px-3 py-0.5 rounded-full">
                  {levelLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>


      {group && onOpenCreateExamModal && (
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateExamModal}
            className="w-full md:w-auto bg-[#e1b54d] hover:bg-[#cca341] active:bg-[#b58f33] text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md shadow-[#e1b54d]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>تسجيل امتحان</span>
          </button>
        </div>
      )}
    </div>
  );
};
