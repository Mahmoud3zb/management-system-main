import React from "react";
import type { Payment } from "../../../types";

interface PaymentSheetCardProps {
  payment: Payment;
  onViewDetails: (paymentId: string) => void;
}

const ARABIC_MONTHS: Record<string, string> = {
  "01": "يناير",
  "02": "فبراير",
  "03": "مارس",
  "04": "أبريل",
  "05": "مايو",
  "06": "يونيو",
  "07": "يوليو",
  "08": "أغسطس",
  "09": "سبتمبر",
  "10": "أكتوبر",
  "11": "نوفمبر",
  "12": "ديسمبر",
};

export const formatArabicMonth = (monthStr: string): string => {
  if (!monthStr) return "";
  const parts = monthStr.split("-");
  if (parts.length === 2) {
    const year = parts[0];
    const monthNum = parts[1].padStart(2, "0");
    const monthName = ARABIC_MONTHS[monthNum] || monthNum;
    return `${monthName} ${year}`;
  }
  return monthStr;
};

export const PaymentSheetCard: React.FC<PaymentSheetCardProps> = ({
  payment,
  onViewDetails,
}) => {
  const arabicMonth = formatArabicMonth(payment.month);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-200 text-right flex flex-col justify-between space-y-5" dir="rtl">
      <div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4F8A70]"></span>
            <span className="text-xs font-extrabold text-[#4F8A70] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
              كشف شهر {payment.month}
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("ar-EG") : ""}
          </span>
        </div>


        <h3 className="text-lg font-black text-slate-900 mb-1">
          {arabicMonth || payment.month}
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          سجل المصاريف الدراسية لشهري المستحقات
        </p>
      </div>


      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => onViewDetails(payment._id)}
          className="w-full bg-[#4F8A70] hover:bg-[#3f705b] active:bg-[#345d4b] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-[#4F8A70]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>عرض كشف الشهر</span>
        </button>
      </div>
    </div>
  );
};
