import React, { useEffect, useState } from "react";
import { getPaymentByIdApi } from "../api";
import { isPaymentRecordPaid } from "../utils";
import { formatArabicMonth } from "./PaymentSheetCard";
import type { Payment, User } from "../../../types";
import type { ApiErrorResponse } from "../../../services/apiClient";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  paymentId: string | null;
  onClose: () => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  paymentId,
  onClose,
}) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !paymentId) {
      setPayment(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchDetails = async () => {
      try {
        const response = await getPaymentByIdApi(paymentId);
        if (isMounted) {
          setPayment(response.data || null);
        }
      } catch (err: any) {
        if (isMounted) {
          const apiErr = err as ApiErrorResponse;
          if (apiErr?.status === 401) {
            setError("انتهت جلسة العمل أو غير مصرح، يرجى إعادة تسجيل الدخول.");
          } else if (apiErr?.status === 404) {
            setError("كشف المدفوعات غير موجود.");
          } else {
            setError(apiErr?.message || "تعذر تحميل بيانات كشف المدفوعات.");
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, paymentId]);

  if (!isOpen) return null;

  const paidList = payment?.paidList || [];
  const totalStudents = paidList.length;

  const paidCount = paidList.filter((item) => isPaymentRecordPaid(item)).length;
  const unpaidCount = paidList.filter((item) => !isPaymentRecordPaid(item)).length;

  const arabicMonth = payment ? formatArabicMonth(payment.month) : "";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#4F8A70] rounded-full"></span>
              <h3 className="text-base font-black text-slate-900">
                كشف مدفوعات شهر {arabicMonth || payment?.month || ""}
              </h3>
            </div>
            {payment?.month && (
              <p className="text-xs font-bold text-slate-400 mt-0.5 mr-3.5">
                تاريخ الكشف: {payment.month}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3 py-4">
              <div className="h-10 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
              ))}
            </div>
          ) : !payment ? (
            <div className="p-8 border border-slate-200 border-dashed rounded-2xl text-center text-slate-400 text-xs font-bold">
              لا توجد بيانات متاحة لكشف المدفوعات.
            </div>
          ) : (
            <>
              {/* Summary Badges Bar */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-lg">
                    مدفوع: {paidCount}
                  </span>
                  <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-3 py-1 rounded-lg">
                    غير مدفوع: {unpaidCount}
                  </span>
                </div>

                <span className="text-xs font-extrabold text-slate-600">
                  إجمالي الطلاب: {totalStudents}
                </span>
              </div>

              {/* Student Payment Table */}
              {paidList.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center text-xs font-bold text-slate-500">
                  لا يوجد طلاب في كشف المدفوعات لهذا الشهر.
                </div>
              ) : (
                <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead className="bg-slate-50/90 border-b border-slate-100 text-slate-500 font-bold">
                        <tr>
                          <th className="py-3 px-4 text-center w-10">#</th>
                          <th className="py-3 px-4">اسم الطالب</th>
                          <th className="py-3 px-4 text-center">رقم الهاتف</th>
                          <th className="py-3 px-4 text-center">الحالة</th>
                          <th className="py-3 px-4 text-center">تاريخ الدفع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {paidList.map((item, idx) => {
                          const studentObj =
                            typeof item.studentID === "object" && item.studentID !== null
                              ? (item.studentID as User)
                              : null;
                          const studentName = studentObj ? studentObj.name : "طالب غير معروف";
                          const studentPhone = studentObj ? studentObj.phone || "-" : "-";
                          const isPaid = isPaymentRecordPaid(item);

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-4 font-extrabold text-slate-900">{studentName}</td>
                              <td className="py-3 px-4 text-center font-mono text-slate-500 dir-ltr">
                                {studentPhone}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isPaid ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-block">
                                    مدفوع
                                  </span>
                                ) : (
                                  <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-block">
                                    غير مدفوع
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px] dir-ltr">
                                {isPaid && item.paidAt && item.paidAt !== "-" ? item.paidAt : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
