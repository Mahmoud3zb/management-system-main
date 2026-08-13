import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { ROUTES } from "../routes/paths";
import type { ApiErrorResponse } from "../services/apiClient";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    try {
      await login({ email: email.trim(), password });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr.status === 401) {
        setErrorMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (apiErr.message) {
        setErrorMessage(apiErr.message);
      } else {
        setErrorMessage("حدث خطأ في الاتصال بالخادم. الرجاء المحاولة لاحقاً.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/50 via-slate-50 to-blue-50/30 flex flex-col items-center justify-center p-4 font-sans text-right" dir="rtl">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl shadow-slate-300/40 text-slate-800 relative overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#367ab8]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="relative shrink-0">
            <img
              src="/logo.jpg"
              alt="سلسلة الفولاذ - الأستاذ علي عبد القادر"
              className="w-16 h-16 rounded-2xl border-2 border-amber-500/80 p-0.5 shadow-md shadow-amber-500/20 object-cover bg-white"
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              الفولاذ
            </span>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">الأستاذ / علي عبد القادر</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2.5 font-medium">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-bold text-slate-700">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              placeholder="teacher@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all text-left placeholder:text-slate-400 disabled:opacity-50"
              dir="ltr"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-bold text-slate-700">كلمة المرور</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all text-left placeholder:text-slate-400 disabled:opacity-50"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#367ab8] hover:bg-[#2d679c] active:bg-[#255581] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#367ab8]/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري تسجيل الدخول...
              </span>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>
      </div>

      <footer className="mt-6 text-center text-[11px] text-slate-400/80 font-medium tracking-wide select-none" dir="ltr">
        made by <span className="font-semibold text-slate-500 hover:text-slate-700 transition-colors">ma7arek</span> &amp; <span className="font-semibold text-slate-500 hover:text-slate-700 transition-colors">3zb</span>
      </footer>
    </div>
  );
};
