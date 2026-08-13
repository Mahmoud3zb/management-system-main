import React, { useState, useEffect } from "react";
import { updateExamApi } from "../api";
import type { Exam, UpdateExamPayload } from "../../../types";
import type { ApiErrorResponse } from "../../../services/apiClient";

interface EditExamModalProps {
  isOpen: boolean;
  exam: Exam | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const EditExamModal: React.FC<EditExamModalProps> = ({
  isOpen,
  exam,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [maxMarks, setMaxMarks] = useState<string>("100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && exam) {
      setTitle(exam.title || "");
      setDate(exam.date || "");
      setMaxMarks(String(exam.maxMarks ?? 100));
      setError(null);
    }
  }, [isOpen, exam]);

  if (!isOpen || !exam) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("عنوان الامتحان مطلوب.");
      return;
    }

    const trimmedDate = date.trim();
    if (!trimmedDate) {
      setError("تاريخ الامتحان مطلوب.");
      return;
    }

    const parsedMax = parseFloat(maxMarks);
    if (isNaN(parsedMax) || parsedMax <= 0) {
      setError("الدرجة النهائية يجب أن تكون رقماً أكبر من 0.");
      return;
    }

    const payload: UpdateExamPayload = {
      title: trimmedTitle,
      date: trimmedDate,
      maxMarks: parsedMax,
    };

    setIsSubmitting(true);

    try {
      await updateExamApi(exam._id, payload);
      onSuccess("تم تعديل بيانات الامتحان بنجاح");
      onClose();
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr?.status === 401) {
        setError("انتهت جلسة العمل، يرجى إعادة تسجيل الدخول.");
      } else if (apiErr?.status === 400) {
        setError(apiErr.message || "بيانات الامتحان غير صحيحة، يرجى التحقق والتكرار.");
      } else {
        setError(apiErr?.message || "حدث خطأ أثناء تعديل بيانات الامتحان، حاول مرة أخرى.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#e1b54d] rounded-full"></span>
              <h3 className="text-base font-black text-slate-900">تعديل بيانات الامتحان</h3>
            </div>
            <p className="text-xs font-bold text-[#367ab8] mt-0.5 mr-3.5">
              الامتحان الحالي: {exam.title}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="editTitle" className="text-xs font-bold text-slate-700 block">
              عنوان الامتحان <span className="text-rose-500">*</span>
            </label>
            <input
              id="editTitle"
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الامتحان"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#e1b54d] focus:ring-4 focus:ring-[#e1b54d]/15 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="editDate" className="text-xs font-bold text-slate-700 block">
                تاريخ الامتحان <span className="text-rose-500">*</span>
              </label>
              <input
                id="editDate"
                type="date"
                required
                disabled={isSubmitting}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#e1b54d] focus:ring-4 focus:ring-[#e1b54d]/15 transition-all cursor-pointer dir-ltr text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="editMaxMarks" className="text-xs font-bold text-slate-700 block">
                الدرجة النهائية <span className="text-rose-500">*</span>
              </label>
              <input
                id="editMaxMarks"
                type="number"
                min="1"
                step="1"
                required
                disabled={isSubmitting}
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:bg-white focus:border-[#e1b54d] focus:ring-4 focus:ring-[#e1b54d]/15 transition-all dir-ltr text-right"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#e1b54d] hover:bg-[#cca341] text-white font-bold rounded-xl text-xs shadow-md shadow-[#e1b54d]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري حفظ التعديلات...
                </span>
              ) : (
                "حفظ التعديلات"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
