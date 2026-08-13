import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/paths";
import type { Group, AcademicLevel } from "../../../types";

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
}

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

const LEVEL_BADGE_STYLES: Record<AcademicLevel, string> = {
  first: "bg-blue-50 text-blue-700 border-blue-200",
  second: "bg-indigo-50 text-indigo-700 border-indigo-200",
  third: "bg-amber-50 text-amber-700 border-amber-200",
};

export const GroupCard: React.FC<GroupCardProps> = ({ group, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const levelKey = group.level as AcademicLevel;
  const levelLabel = LEVEL_LABELS[levelKey] || group.level;
  const badgeStyle = LEVEL_BADGE_STYLES[levelKey] || "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 group-hover:text-[#367ab8] transition-colors">
              {group.name}
            </h3>
            <span className={`inline-block border text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 ${badgeStyle}`}>
              {levelLabel}
            </span>
          </div>


        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(`${ROUTES.GROUPS}/${group._id}`)}
          className="bg-slate-100 hover:bg-[#367ab8] hover:text-white text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>فتح المجموعة</span>
          <svg className="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(group)}
            className="p-2 text-slate-400 hover:text-[#367ab8] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="تعديل المجموعة"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(group)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="حذف المجموعة"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
