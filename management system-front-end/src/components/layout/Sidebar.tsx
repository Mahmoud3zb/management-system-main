import React from "react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../routes/paths";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine current active group ID if user is in group details or feature pages
  const groupDetailsMatch = location.pathname.match(/^\/groups\/([^/]+)$/);
  const currentGroupId = groupDetailsMatch ? groupDetailsMatch[1] : searchParams.get("groupId");

  const getTargetUrl = (basePath: string): string => {
    if (!currentGroupId) return basePath;
    if (basePath === ROUTES.ATTENDANCE || basePath === ROUTES.EXAMS || basePath === ROUTES.PAYMENTS) {
      return `${basePath}?groupId=${currentGroupId}`;
    }
    return basePath;
  };

  const navItems = [
    {
      title: "الرئيسية",
      path: ROUTES.DASHBOARD,
      target: ROUTES.DASHBOARD,
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 00-1 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: "المجموعات",
      path: ROUTES.GROUPS,
      target: ROUTES.GROUPS,
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: "الغياب والحضور",
      path: ROUTES.ATTENDANCE,
      target: getTargetUrl(ROUTES.ATTENDANCE),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "الامتحانات والدرجات",
      path: ROUTES.EXAMS,
      target: getTargetUrl(ROUTES.EXAMS),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "الاشتراكات والمدفوعات",
      path: ROUTES.PAYMENTS,
      target: getTargetUrl(ROUTES.PAYMENTS),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-64 bg-white border-l border-slate-200/80 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
        dir="rtl"
      >
        <div>
          {/* Logo & Brand */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="سلسلة الفولاذ"
                className="w-11 h-11 rounded-xl border-2 border-amber-500/80 p-0.5 object-cover bg-white shadow-sm"
              />
              <div className="text-right">
                <h1 className="text-sm font-extrabold text-slate-900 leading-tight"> أ\علي عبد القادر</h1>
                <p className="text-[11px] text-rose-600 font-bold">سلسلة الفولاذ</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.target}
                onClick={() => onClose()}
                end={item.path === ROUTES.DASHBOARD || item.path === ROUTES.GROUPS}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive || location.pathname.startsWith(item.path)
                      ? "bg-[#367ab8] text-white shadow-md shadow-[#367ab8]/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`
                }
              >
                {item.icon}
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400/80 font-medium tracking-wide select-none" dir="ltr">
            made by <span className="font-semibold text-slate-500">ma7arek</span> &amp; <span className="font-semibold text-slate-500">3zb</span>
          </p>
        </div>
      </aside>
    </>
  );
};
