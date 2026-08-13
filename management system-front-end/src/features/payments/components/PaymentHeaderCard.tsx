import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/paths";
import type { Group, AcademicLevel } from "../../../types";

interface PaymentHeaderCardProps {
  group: Group | null;
  totalSheets: number;
  isLoading: boolean;
  onOpenRecordModal?: () => void;
}

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

export const PaymentHeaderCard: React.FC<PaymentHeaderCardProps> = ({
  group,
  totalSheets,
  isLoading,
  onOpenRecordModal,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 animate-pulse space-y-4 text-right" dir="rtl">
        <div className="h-6 bg-slate-100 rounded-full w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded-full w-1/4"></div>
      </div>
    );
  }

  if (!group) return null;

  const levelLabel = LEVEL_LABELS[group.level as AcademicLevel] || group.level;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`${ROUTES.GROUPS}/${group._id}`);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <button
              onClick={handleBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer shrink-0"
              title="العودة للصفحة السابقة"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#4F8A70] rounded-full"></span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                سجل مدفوعات مجموعة: {group.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 mr-11">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
              {levelLabel}
            </span>
            {group.studentCount !== undefined && (
              <span className="bg-emerald-50 text-[#4F8A70] border border-emerald-200 px-3 py-1 rounded-full">
                عدد الطلاب: {group.studentCount}
              </span>
            )}
          </div>
        </div>

        {/* Action Button & Total Sheets Badge */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {onOpenRecordModal && (
            <button
              onClick={onOpenRecordModal}
              className="bg-[#4F8A70] hover:bg-[#3f705b] active:bg-[#345d4b] text-white font-extrabold px-5 py-3 rounded-2xl text-xs shadow-md shadow-[#4F8A70]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>تسجيل مدفوعات الشهر</span>
            </button>
          )}

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-center shrink-0 min-w-[130px]">
            <span className="text-[11px] font-extrabold text-[#4F8A70] block mb-0.5">الشهور المسجلة</span>
            <span className="text-xl font-black text-emerald-950">{totalSheets}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
