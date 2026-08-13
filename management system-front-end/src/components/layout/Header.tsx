import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { ROUTES } from "../../routes/paths";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const formatTeacherName = (name?: string) => {
    if (!name) return "أ. علي";
    if (name.toLowerCase().includes("ali") || name.toLowerCase().includes("abdelkader")) {
      return "أ. علي";
    }
    return name;
  };

  const teacherName = formatTeacherName(user?.name);

  const handleBack = () => {

    if (location.pathname.startsWith("/groups/")) {
      navigate(ROUTES.GROUPS);
    }

    else if (location.pathname !== ROUTES.DASHBOARD) {
      navigate(ROUTES.DASHBOARD);
    }

    else {
      navigate(-1);
    }
  };

  return (
    <header className="h-16 bg-[#367ab8] text-white px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md" dir="rtl">

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-white/90 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="فتح القائمة"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center p-1">
            <img src="/logo.jpg" alt="الفولاذ" className="w-full h-full object-cover rounded-md" />
          </div>
          <h2 className="text-base font-extrabold tracking-wide text-white">
            منصة الفولاذ | {teacherName}
          </h2>
        </div>
      </div>


      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
          title="الرجوع للصفحة الرئيسية"
        >
          <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span>رجوع</span>
        </button>
      </div>
    </header>
  );
};
