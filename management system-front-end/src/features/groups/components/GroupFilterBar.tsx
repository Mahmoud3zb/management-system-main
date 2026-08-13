import React from "react";
import type { AcademicLevel } from "../../../types";

interface GroupFilterBarProps {
  activeLevel: AcademicLevel | "all";
  searchQuery: string;
  onLevelChange: (level: AcademicLevel | "all") => void;
  onSearchChange: (query: string) => void;
}

export const GroupFilterBar: React.FC<GroupFilterBarProps> = ({
  activeLevel,
  searchQuery,
  onLevelChange,
  onSearchChange,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          onClick={() => onLevelChange("all")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeLevel === "all"
              ? "bg-[#367ab8] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
        >
          كل المراحل
        </button>
        <button
          onClick={() => onLevelChange("first")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeLevel === "first"
              ? "bg-[#367ab8] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
        >
          الأول الثانوي
        </button>
        <button
          onClick={() => onLevelChange("second")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeLevel === "second"
              ? "bg-[#367ab8] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
        >
          الثاني الثانوي
        </button>
        <button
          onClick={() => onLevelChange("third")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeLevel === "third"
              ? "bg-[#367ab8] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
        >
          الثالث الثانوي
        </button>
      </div>


      <div className="relative w-full md:w-72">
        <input
          type="text"
          placeholder="بحث باسم المجموعة..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/15 transition-all placeholder:text-slate-400"
        />
        <svg className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
};
