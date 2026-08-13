import React from "react";
import type { Group, AcademicLevel } from "../../../types";

interface GroupFormModalProps {
  isOpen: boolean;
  editingGroup: Group | null;
  formName: string;
  formLevel: AcademicLevel;
  isSubmitting: boolean;
  error: string | null;
  onNameChange: (val: string) => void;
  onLevelChange: (val: AcademicLevel) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  editingGroup,
  formName,
  formLevel,
  isSubmitting,
  error,
  onNameChange,
  onLevelChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900">
            {editingGroup ? "تعديل بيانات المجموعة" : "إضافة مجموعة جديدة"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="groupName" className="text-xs font-bold text-slate-700">
              اسم المجموعة <span className="text-rose-500">*</span>
            </label>
            <input
              id="groupName"
              type="text"
              placeholder="مثال: مجموعة أ - السبت والثلاثاء"
              value={formName}
              onChange={(e) => onNameChange(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="groupLevel" className="text-xs font-bold text-slate-700">
              المرحلة الدراسية <span className="text-rose-500">*</span>
            </label>
            <select
              id="groupLevel"
              value={formLevel}
              onChange={(e) => onLevelChange(e.target.value as AcademicLevel)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all"
            >
              <option value="first">الصف الأول الثانوي</option>
              <option value="second">الصف الثاني الثانوي</option>
              <option value="third">الصف الثالث الثانوي</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#367ab8] hover:bg-[#2d679c] text-white font-bold rounded-xl text-xs shadow-md shadow-[#367ab8]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </span>
              ) : editingGroup ? (
                "حفظ التعديلات"
              ) : (
                "إضافة المجموعة"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
