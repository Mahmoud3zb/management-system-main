import React, { useState, useEffect } from "react";
import { updateStudentMarkApi } from "../api";
import type { UpdateStudentMarkPayload } from "../../../types";
import type { ApiErrorResponse } from "../../../services/apiClient";

export interface StudentMarkItemTarget {
  studentID: string;
  studentName: string;
  studentPhone: string;
  currentMarks: number;
}

interface EditStudentMarkModalProps {
  isOpen: boolean;
  examId: string;
  maxMarks: number;
  targetStudent: StudentMarkItemTarget | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const EditStudentMarkModal: React.FC<EditStudentMarkModalProps> = ({
  isOpen,
  examId,
  maxMarks,
  targetStudent,
  onClose,
  onSuccess,
}) => {
  const [markInput, setMarkInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && targetStudent) {
      setMarkInput(String(targetStudent.currentMarks ?? ""));
      setError(null);
    }
  }, [isOpen, targetStudent]);

  if (!isOpen || !targetStudent) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawVal = markInput.trim();
    if (rawVal === "") {
      setError("يرجى إدخال درجة الطالب.");
      return;
    }

    const parsedMark = parseFloat(rawVal);
    if (isNaN(parsedMark)) {
      setError("الدرجة المدخلة غير صحيحة.");
      return;
    }

    if (parsedMark < 0) {
      setError("درجة الطالب لا يمكن أن تكون بالسالب.");
      return;
    }

    if (parsedMark > maxMarks) {
      setError(`درجة الطالب (${parsedMark}) تتجاوز الدرجة النهائية للامتحان (${maxMarks}).`);
      return;
    }

    const payload: UpdateStudentMarkPayload = {
      studentID: targetStudent.studentID,
      marks: parsedMark,
    };

    setIsSubmitting(true);

    try {
      await updateStudentMarkApi(examId, payload);
      onSuccess("تم تحديث درجة الطالب بنجاح");
      onClose();
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr?.status === 401) {
        setError("انتهت جلسة العمل، يرجى إعادة تسجيل الدخول.");
      } else if (apiErr?.status === 400) {
        setError(apiErr.message || "الدرجة المدخلة غير صحيحة.");
      } else {
        setError(apiErr?.message || "حدث خطأ أثناء تحديث درجة الطالب، حاول مرة أخرى.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">

        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#e1b54d] rounded-full"></span>
              <h3 className="text-base font-black text-slate-900">تعديل درجة الطالب</h3>
            </div>
            <p className="text-xs font-extrabold text-[#367ab8] mt-0.5 mr-3.5">
              {targetStudent.studentName}
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


        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">رقم الهاتف:</span>
              <span className="font-mono text-slate-800 dir-ltr">{targetStudent.studentPhone || "-"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">الدرجة النهائية للامتحان:</span>
              <span className="font-black text-amber-800">{maxMarks}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="newStudentMark" className="text-xs font-bold text-slate-700 block">
              الدرجة الجديدة <span className="text-rose-500">*</span>
            </label>
            <input
              id="newStudentMark"
              type="number"
              min="0"
              max={maxMarks}
              step="0.5"
              required
              disabled={isSubmitting}
              value={markInput}
              onChange={(e) => setMarkInput(e.target.value)}
              placeholder="أدخل درجة الطالب"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:bg-white focus:border-[#e1b54d] focus:ring-4 focus:ring-[#e1b54d]/15 transition-all dir-ltr text-right"
            />
          </div>


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
                  جاري تحديث الدرجة...
                </span>
              ) : (
                "حفظ الدرجة"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
