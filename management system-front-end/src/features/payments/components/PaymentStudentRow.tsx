import React from "react";
import type { User } from "../../../types";

interface PaymentStudentRowProps {
  student: User;
  index: number;
  isPaid: boolean;
  paidAt: string;
  disabled: boolean;
  onToggle: (studentId: string, isPaid: boolean) => void;
  onPaidAtChange: (studentId: string, date: string) => void;
}

export const PaymentStudentRow: React.FC<PaymentStudentRowProps> = ({
  student,
  index,
  isPaid,
  paidAt,
  disabled,
  onToggle,
  onPaidAtChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all text-right gap-3" dir="rtl">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-slate-200/80 text-slate-500 text-xs font-extrabold flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        <div>
          <h4 className="text-xs font-black text-slate-900 leading-snug">
            {student.name}
          </h4>
          <span className="text-[11px] font-mono text-slate-400 dir-ltr block">
            {student.phone || "-"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {isPaid && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 shrink-0">تاريخ الاستلام:</span>
            <input
              type="date"
              disabled={disabled}
              value={paidAt && paidAt !== "-" ? paidAt : ""}
              onChange={(e) => onPaidAtChange(student._id, e.target.value)}
              className="bg-transparent text-xs font-bold font-mono text-emerald-800 focus:outline-none cursor-pointer"
            />
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onToggle(student._id, true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
              isPaid
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            مدفوع
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onToggle(student._id, false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
              !isPaid
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            غير مدفوع
          </button>
        </div>
      </div>
    </div>
  );
};
