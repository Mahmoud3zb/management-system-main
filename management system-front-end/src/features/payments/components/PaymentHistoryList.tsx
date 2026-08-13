import React from "react";
import { PaymentSheetCard } from "./PaymentSheetCard";
import type { Payment } from "../../../types";

interface PaymentHistoryListProps {
  payments: Payment[];
  isLoading: boolean;
  onViewDetails: (paymentId: string) => void;
  onOpenRecordModal?: () => void;
}

export const PaymentHistoryList: React.FC<PaymentHistoryListProps> = ({
  payments,
  isLoading,
  onViewDetails,
  onOpenRecordModal,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="h-5 bg-slate-100 rounded-full w-2/3"></div>
            <div className="h-12 bg-slate-100 rounded-2xl w-full"></div>
            <div className="h-10 bg-slate-100 rounded-xl w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center my-6 shadow-xs text-right" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-[#4F8A70]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-slate-800 mb-1">
          لا توجد سجلات مدفوعات لهذه المجموعة حتى الآن
        </h3>
        <p className="text-xs text-slate-400 font-medium max-w-md mx-auto mb-6">
          سيظهر هنا سجل المصاريف وكشوفات الشهر للمجموعة عند تسجيل أو رصد دفعة مالية لأحد الطلاب.
        </p>

        {onOpenRecordModal && (
          <button
            onClick={onOpenRecordModal}
            className="bg-[#4F8A70] hover:bg-[#3f705b] active:bg-[#345d4b] text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md shadow-[#4F8A70]/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>تسجيل مدفوعات شهر الآن</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {payments.map((payment) => (
        <PaymentSheetCard
          key={payment._id}
          payment={payment}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
