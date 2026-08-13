import React, { useState, useEffect } from "react";
import { getGroupStudentsApi } from "../../groups/api";
import { recordPaymentApi, getPaymentByIdApi } from "../api";
import { getStudentId, isPaymentRecordPaid } from "../utils";
import { PaymentStudentRow } from "./PaymentStudentRow";
import type { User, Payment, RecordPaymentPayload } from "../../../types";
import type { ApiErrorResponse } from "../../../services/apiClient";

interface RecordPaymentModalProps {
  isOpen: boolean;
  groupId: string | null;
  groupName: string;
  existingPayments: Payment[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const getCurrentMonthFormatted = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getTodayFormattedDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  groupId,
  groupName,
  existingPayments,
  onClose,
  onSuccess,
}) => {
  const [month, setMonth] = useState(getCurrentMonthFormatted());
  const [students, setStudents] = useState<User[]>([]);
  const [paymentState, setPaymentState] = useState<Record<string, boolean>>({});
  const [paidAtState, setPaidAtState] = useState<Record<string, string>>({});
  const [initialPaymentState, setInitialPaymentState] = useState<Record<string, boolean>>({});
  const [initialPaidAtState, setInitialPaidAtState] = useState<Record<string, string>>({});

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [partialError, setPartialError] = useState<string | null>(null);

  // Fetch active students on modal open
  useEffect(() => {
    if (!isOpen || !groupId) return;

    let isMounted = true;
    setIsLoadingStudents(true);
    setError(null);
    setPartialError(null);
    setMonth(getCurrentMonthFormatted());

    const fetchStudents = async () => {
      try {
        const response = await getGroupStudentsApi(groupId);
        if (isMounted) {
          setStudents(response.data || []);
        }
      } catch (err: any) {
        if (isMounted) {
          const apiErr = err as ApiErrorResponse;
          setError(apiErr?.message || "تعذر تحميل قائمة طلاب المجموعة.");
        }
      } finally {
        if (isMounted) setIsLoadingStudents(false);
      }
    };

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, [isOpen, groupId]);

  // Load existing payment sheet for selected month if it exists
  useEffect(() => {
    if (!isOpen || !groupId || students.length === 0) return;

    let isMounted = true;
    setIsLoadingSheet(true);

    const existingSheet = existingPayments.find((p) => p.month === month);

    const loadSheetData = async () => {
      const todayDate = getTodayFormattedDate();
      const initialMap: Record<string, boolean> = {};
      const datesMap: Record<string, string> = {};

      if (existingSheet) {
        try {
          const res = await getPaymentByIdApi(existingSheet._id);
          const sheetData = res.data;
          const paidList = sheetData?.paidList || [];

          const existingPaidMap: Record<string, { isPaid: boolean; paidAt: string }> = {};
          paidList.forEach((item) => {
            const sId = getStudentId(item.studentID);
            if (!sId) return;

            const isStudentPaid = isPaymentRecordPaid(item);
            existingPaidMap[sId] = {
              isPaid: isStudentPaid,
              paidAt: item.paidAt || todayDate,
            };
          });

          students.forEach((student) => {
            const rec = existingPaidMap[student._id];
            const isPaidVal = rec ? rec.isPaid : false;
            initialMap[student._id] = isPaidVal;
            datesMap[student._id] = rec ? rec.paidAt : todayDate;
          });
        } catch (err) {
          console.error("Failed to load existing payment sheet details:", err);
          students.forEach((student) => {
            initialMap[student._id] = false;
            datesMap[student._id] = todayDate;
          });
        }
      } else {
        students.forEach((student) => {
          initialMap[student._id] = false;
          datesMap[student._id] = todayDate;
        });
      }

      if (isMounted) {
        setPaymentState(initialMap);
        setInitialPaymentState(initialMap);
        setPaidAtState(datesMap);
        setInitialPaidAtState(datesMap);
        setIsLoadingSheet(false);
      }
    };

    loadSheetData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, groupId, month, students, existingPayments]);

  if (!isOpen) return null;

  const handleToggle = (studentId: string, isPaid: boolean) => {
    setPaymentState((prev) => ({
      ...prev,
      [studentId]: isPaid,
    }));
    if (isPaid && (!paidAtState[studentId] || paidAtState[studentId] === "-")) {
      setPaidAtState((prev) => ({
        ...prev,
        [studentId]: getTodayFormattedDate(),
      }));
    }
  };

  const handlePaidAtChange = (studentId: string, date: string) => {
    setPaidAtState((prev) => ({
      ...prev,
      [studentId]: date || getTodayFormattedDate(),
    }));
  };

  const handleSetAll = (isPaid: boolean) => {
    const updated: Record<string, boolean> = {};
    const updatedDates: Record<string, string> = {};
    const todayDate = getTodayFormattedDate();

    students.forEach((student) => {
      updated[student._id] = isPaid;
      updatedDates[student._id] = isPaid ? (paidAtState[student._id] && paidAtState[student._id] !== "-" ? paidAtState[student._id] : todayDate) : "-";
    });

    setPaymentState(updated);
    setPaidAtState(updatedDates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPartialError(null);

    if (!groupId) {
      setError("يرجى اختيار مجموعة أولاً لتسجيل المدفوعات.");
      return;
    }

    if (!month || !month.trim()) {
      setError("شهر المستحقات مطلوب (YYYY-MM).");
      return;
    }

    // Filter students whose payment status or paidAt date actually changed
    const changedStudents = students.filter(
      (s) =>
        paymentState[s._id] !== initialPaymentState[s._id] ||
        (paymentState[s._id] && paidAtState[s._id] !== initialPaidAtState[s._id])
    );

    if (changedStudents.length === 0) {
      setError("لا توجد تغييرات لحفظها.");
      return;
    }

    setIsSubmitting(true);
    const todayDate = getTodayFormattedDate();

    const promises = changedStudents.map(async (student) => {
      const isPaid = paymentState[student._id] ?? false;
      const paidAt = isPaid ? (paidAtState[student._id] && paidAtState[student._id] !== "-" ? paidAtState[student._id] : todayDate) : "-";

      const payload: RecordPaymentPayload = {
        studentID: student._id,
        month: month.trim(),
        isPaid,
        paidAt,
      };

      await recordPaymentApi(groupId, payload);
      return student._id;
    });

    const results = await Promise.allSettled(promises);

    let successCount = 0;
    let failureCount = 0;
    const updatedInitialPayment = { ...initialPaymentState };
    const updatedInitialPaidAt = { ...initialPaidAtState };

    results.forEach((res, idx) => {
      const studentId = changedStudents[idx]._id;
      if (res.status === "fulfilled") {
        successCount++;
        updatedInitialPayment[studentId] = paymentState[studentId];
        updatedInitialPaidAt[studentId] = paidAtState[studentId];
      } else {
        failureCount++;
      }
    });

    setInitialPaymentState(updatedInitialPayment);
    setInitialPaidAtState(updatedInitialPaidAt);
    setIsSubmitting(false);

    if (failureCount === 0) {
      onSuccess("تم حفظ المدفوعات بنجاح");
      onClose();
    } else if (successCount > 0) {
      setPartialError("تم حفظ بعض التعديلات، لكن تعذر تحديث بعض الطلاب.");
    } else {
      setError("تعذر حفظ تعديلات المدفوعات، يرجى المحاولة مرة أخرى.");
    }
  };

  const paidCount = students.filter((s) => paymentState[s._id] === true).length;
  const unpaidCount = students.filter((s) => !paymentState[s._id]).length;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#4F8A70] rounded-full"></span>
              <h3 className="text-base font-black text-slate-900">تسجيل مدفوعات الشهر</h3>
            </div>
            <p className="text-xs font-bold text-[#367ab8] mt-0.5 mr-3.5">
              المجموعة: {groupName}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {partialError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{partialError}</span>
            </div>
          )}

          {/* Month Selector */}
          <div className="space-y-1.5">
            <label htmlFor="paymentMonth" className="text-xs font-bold text-slate-700 block">
              شهر المستحقات <span className="text-rose-500">*</span>
            </label>
            <input
              id="paymentMonth"
              type="month"
              required
              disabled={isSubmitting || isLoadingSheet}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#4F8A70] focus:ring-4 focus:ring-[#4F8A70]/15 transition-all cursor-pointer dir-ltr text-right"
            />
          </div>

          {/* Quick Actions & Status Summary */}
          {!isLoadingStudents && students.length > 0 && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-lg">
                  مدفوع: {paidCount}
                </span>
                <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-2.5 py-1 rounded-lg">
                  غير مدفوع: {unpaidCount}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isSubmitting || isLoadingSheet}
                  onClick={() => handleSetAll(true)}
                  className="text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  تحديد الكل مدفوع
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  disabled={isSubmitting || isLoadingSheet}
                  onClick={() => handleSetAll(false)}
                  className="text-[11px] font-bold text-rose-700 hover:bg-rose-100 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  تحديد الكل غير مدفوع
                </button>
              </div>
            </div>
          )}

          {/* Students List */}
          {isLoadingStudents || isLoadingSheet ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="h-12 bg-slate-100 rounded-2xl animate-pulse w-full"></div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 border border-slate-200 border-dashed rounded-2xl text-center">
              <p className="text-xs font-extrabold text-slate-600">لا يوجد طلاب في هذه المجموعة</p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                قم بإضافة طلاب للمجموعة أولاً لتتسنى لك إمكانية تسديد المبالغ المالية.
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 pl-1 scrollbar-thin">
              {students.map((student, idx) => (
                <PaymentStudentRow
                  key={student._id}
                  student={student}
                  index={idx}
                  isPaid={paymentState[student._id] ?? false}
                  paidAt={paidAtState[student._id] || getTodayFormattedDate()}
                  disabled={isSubmitting}
                  onToggle={handleToggle}
                  onPaidAtChange={handlePaidAtChange}
                />
              ))}
            </div>
          )}

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
              disabled={isSubmitting || isLoadingStudents || isLoadingSheet || students.length === 0}
              className="px-6 py-2.5 bg-[#4F8A70] hover:bg-[#3f705b] text-white font-bold rounded-xl text-xs shadow-md shadow-[#4F8A70]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري حفظ المدفوعات...
                </span>
              ) : (
                "حفظ المدفوعات"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
