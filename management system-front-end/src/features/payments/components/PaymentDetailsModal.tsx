import React, { useEffect, useState, useMemo } from "react";
import { getPaymentByIdApi } from "../api";
import { getGroupStudentsApi } from "../../groups/api";
import { isPaymentRecordPaid, getStudentId } from "../utils";
import { formatArabicMonth } from "./PaymentSheetCard";
import type { Payment, User } from "../../../types";
import type { ApiErrorResponse } from "../../../services/apiClient";
import { matchesSearch } from "../../../utils";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  paymentId: string | null;
  groupId?: string | null;
  onClose: () => void;
}

interface MergedPaymentStudentItem {
  student: User;
  isPaid: boolean;
  paidAt: string;
  isLateJoiner: boolean;
  isHistorical?: boolean;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  paymentId,
  groupId,
  onClose,
}) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [mergedStudents, setMergedStudents] = useState<MergedPaymentStudentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !paymentId) {
      setPayment(null);
      setMergedStudents([]);
      setSearchTerm("");
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setSearchTerm("");

    const fetchDetailsAndMerge = async () => {
      try {
        const response = await getPaymentByIdApi(paymentId);
        if (!isMounted) return;

        const paymentData = response.data || null;
        setPayment(paymentData);

        if (!paymentData) {
          setMergedStudents([]);
          return;
        }

        // Determine group ID to fetch master students list
        const targetGroupId =
          groupId ||
          (typeof paymentData.groupID === "object"
            ? (paymentData.groupID as any)._id
            : (paymentData.groupID as string));

        let masterStudentsList: User[] = [];
        if (targetGroupId) {
          try {
            const studentsRes = await getGroupStudentsApi(targetGroupId);
            masterStudentsList = studentsRes.data || [];
          } catch (stErr) {
            console.error("Failed to fetch group master students in PaymentDetailsModal:", stErr);
          }
        }

        const paidList = paymentData.paidList || [];
        const existingPaidMap: Record<string, { isPaid: boolean; paidAt: string }> = {};

        paidList.forEach((item) => {
          const sId = getStudentId(item.studentID);
          if (sId) {
            existingPaidMap[sId] = {
              isPaid: isPaymentRecordPaid(item),
              paidAt: item.paidAt && item.paidAt !== "-" ? item.paidAt : "-",
            };
          }
        });

        // Frontend Merge Logic with Historical Records Preservation:
        if (masterStudentsList.length > 0) {
          const currentIds = new Set<string>(masterStudentsList.map((st) => st._id));
          const merged: MergedPaymentStudentItem[] = [];

          // 1. Current active students in group roster
          masterStudentsList.forEach((st) => {
            const recorded = existingPaidMap[st._id];
            merged.push({
              student: st,
              isPaid: recorded ? recorded.isPaid : false,
              paidAt: recorded ? recorded.paidAt : "-",
              isLateJoiner: recorded === undefined,
              isHistorical: false,
            });
          });

          // 2. Preserve historical students in paidList who are no longer in active roster
          paidList.forEach((item) => {
            const sId = getStudentId(item.studentID);
            if (sId && !currentIds.has(sId)) {
              currentIds.add(sId);
              const studentObj =
                typeof item.studentID === "object" && item.studentID !== null
                  ? (item.studentID as User)
                  : ({
                      _id: sId,
                      name: "طالب غير مسجل حالياً",
                      phone: "-",
                    } as User);
              merged.push({
                student: studentObj,
                isPaid: isPaymentRecordPaid(item),
                paidAt: item.paidAt && item.paidAt !== "-" ? item.paidAt : "-",
                isLateJoiner: false,
                isHistorical: true,
              });
            }
          });

          setMergedStudents(merged);
        } else {
          // Fallback if master students list unavailable: map over paidList
          const fallbackList: MergedPaymentStudentItem[] = paidList.map((item) => {
            const studentObj =
              typeof item.studentID === "object" && item.studentID !== null
                ? (item.studentID as User)
                : ({
                    _id: String(item.studentID),
                    name: "طالب غير معروف",
                    phone: "-",
                  } as User);
            return {
              student: studentObj,
              isPaid: isPaymentRecordPaid(item),
              paidAt: item.paidAt && item.paidAt !== "-" ? item.paidAt : "-",
              isLateJoiner: false,
              isHistorical: false,
            };
          });
          setMergedStudents(fallbackList);
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

    fetchDetailsAndMerge();

    return () => {
      isMounted = false;
    };
  }, [isOpen, paymentId, groupId]);

  // Quick Search Filter logic using matchesSearch (Arabic normalized)
  const filteredStudents = useMemo<MergedPaymentStudentItem[]>(() => {
    if (!searchTerm.trim()) return mergedStudents;
    return mergedStudents.filter((item) =>
      matchesSearch(
        searchTerm,
        item.student.name,
        item.student.phone,
        item.student.parentPhone
      )
    );
  }, [mergedStudents, searchTerm]);

  if (!isOpen) return null;

  const totalStudents = mergedStudents.length;
  const paidCount = mergedStudents.filter((item) => item.isPaid).length;
  const unpaidCount = mergedStudents.filter((item) => !item.isPaid).length;
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
              {/* Quick Search Filter */}
              {mergedStudents.length > 0 && (
                <div className="relative w-full">
                  <svg
                    className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث باسم الطالب أو رقم الهاتف..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-8 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#4F8A70] focus:ring-2 focus:ring-[#4F8A70]/20 transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      title="مسح البحث"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

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
                  إجمالي الطلاب: {filteredStudents.length} / {totalStudents}
                </span>
              </div>

              {/* Student Payment Table */}
              {filteredStudents.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center text-xs font-bold text-slate-500">
                  {searchTerm
                    ? "لا يوجد طلاب مطابقين للبحث."
                    : "لا يوجد طلاب في كشف المدفوعات لهذا الشهر."}
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
                        {filteredStudents.map((item, idx) => {
                          const studentName = item.student.name || "طالب غير معروف";
                          const studentPhone = item.student.phone || "-";

                          return (
                            <tr key={item.student._id || idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900">{studentName}</span>
                                  {item.isLateJoiner && (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                      منضم حديثاً
                                    </span>
                                  )}
                                  {item.isHistorical && (
                                    <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" title="طالب مسجل في كشف الشهر وغير مدرج بالقائمة الحالية للمجموعة">
                                      سجل سابق
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-mono text-slate-500 dir-ltr">
                                {studentPhone}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {item.isPaid ? (
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
                                {item.isPaid && item.paidAt && item.paidAt !== "-" ? item.paidAt : "-"}
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

