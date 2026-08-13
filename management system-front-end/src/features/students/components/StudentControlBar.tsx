import React from "react";

interface StudentControlBarProps {
  totalStudents: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab?: "attendance" | "payments";
  onTabChange?: (tab: "attendance" | "payments") => void;
  onOpenRecordPaymentModal?: () => void;
}

export const StudentControlBar: React.FC<StudentControlBarProps> = ({
  totalStudents,
  searchQuery,
  onSearchChange,
  activeTab = "attendance",
  onTabChange,
  onOpenRecordPaymentModal,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4" dir="rtl">

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-slate-900">قائمة الطلاب</h2>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {totalStudents} طالب
          </span>
        </div>

        {onTabChange && (
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 mr-2">
            <button
              onClick={() => onTabChange("attendance")}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "attendance"
                  ? "bg-white text-[#ce5071] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              كشف الحضور
            </button>
            <button
              onClick={() => onTabChange("payments")}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "payments"
                  ? "bg-white text-[#4F8A70] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              كشف المدفوعات
            </button>
          </div>
        )}
      </div>


      <div className="flex items-center gap-2 flex-col sm:flex-row w-full md:w-auto">
        {activeTab === "payments" && onOpenRecordPaymentModal && (
          <button
            onClick={onOpenRecordPaymentModal}
            className="w-full sm:w-auto bg-[#4F8A70] hover:bg-[#3f705b] text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md shadow-[#4F8A70]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>تسجيل مدفوعات شهر</span>
          </button>
        )}

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="بحث باسم الطالب أو الهاتف..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/15 transition-all placeholder:text-slate-400"
          />
          <svg className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
