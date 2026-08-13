import React from "react";
import type { Group, AcademicLevel } from "../../../types";

interface AttendanceGroupSelectorProps {
  groups: Group[];
  selectedGroupId: string | null;
  isLoadingGroups: boolean;
  onSelectGroup: (groupId: string) => void;
}

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

export const AttendanceGroupSelector: React.FC<AttendanceGroupSelectorProps> = ({
  groups,
  selectedGroupId,
  isLoadingGroups,
  onSelectGroup,
}) => {
  if (isLoadingGroups) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs animate-pulse">
        <div className="h-5 bg-slate-100 rounded-full w-1/4 mb-3"></div>
        <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4" dir="rtl">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#ce5071] rounded-full"></span>
        <h2 className="text-base font-extrabold text-slate-900">اختر المجموعة الدراسية</h2>
      </div>

      <div className="w-full sm:w-80">
        <select
          value={selectedGroupId || ""}
          onChange={(e) => onSelectGroup(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#ce5071] focus:ring-4 focus:ring-[#ce5071]/15 transition-all cursor-pointer"
        >
          <option value="" disabled>
            -- اختر مجموعة لمتابعة الغياب --
          </option>
          {groups.map((group) => {
            const levelText = LEVEL_LABELS[group.level as AcademicLevel] || group.level;
            return (
              <option key={group._id} value={group._id}>
                {group.name} - ({levelText})
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};
