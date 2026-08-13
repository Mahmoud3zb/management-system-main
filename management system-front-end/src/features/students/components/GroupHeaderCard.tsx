import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/paths";
import type { Group, AcademicLevel } from "../../../types";

interface GroupHeaderCardProps {
  group: Group;
  onOpenAddStudentModal: () => void;
}

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

export const GroupHeaderCard: React.FC<GroupHeaderCardProps> = ({
  group,
  onOpenAddStudentModal,
}) => {
  const navigate = useNavigate();
  const levelLabel = LEVEL_LABELS[group.level as AcademicLevel] || group.level;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(ROUTES.GROUPS)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
            title="العودة إلى المجموعات"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {group.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-blue-50 text-[#367ab8] border border-blue-200 text-xs font-bold px-3 py-0.5 rounded-full">
                {levelLabel}
              </span>
            </div>
          </div>
        </div>
      </div>


      <div className="flex flex-wrap items-center gap-2.5">

        <button
          onClick={() => navigate(`${ROUTES.ATTENDANCE}?groupId=${group._id}`)}
          className="bg-[#ce5071] hover:bg-[#b84361] active:bg-[#a23952] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-[#ce5071]/20 cursor-pointer flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>الغياب والحضور</span>
        </button>


        <button
          onClick={() => navigate(`${ROUTES.EXAMS}?groupId=${group._id}`)}
          className="bg-[#e1b54d] hover:bg-[#cca341] active:bg-[#b58f33] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-[#e1b54d]/20 cursor-pointer flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>الامتحانات</span>
        </button>


        <button
          onClick={() => navigate(`${ROUTES.PAYMENTS}?groupId=${group._id}`)}
          className="bg-[#87a856] hover:bg-[#759549] active:bg-[#64823c] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-[#87a856]/20 cursor-pointer flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>المدفوعات</span>
        </button>


        <button
          onClick={onOpenAddStudentModal}
          className="bg-[#367ab8] hover:bg-[#2d679c] active:bg-[#255581] text-white font-bold px-4.5 py-2.5 rounded-xl text-xs shadow-md shadow-[#367ab8]/20 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>إضافة طالب</span>
        </button>
      </div>
    </div>
  );
};
