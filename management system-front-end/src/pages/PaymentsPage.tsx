import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getGroupByIdApi } from "../features/groups/api";
import { getGroupPaymentsApi } from "../features/payments/api";
import {
  PaymentHeaderCard,
  PaymentHistoryList,
  PaymentPagination,
  PaymentDetailsModal,
  RecordPaymentModal,
} from "../features/payments/components";
import { ROUTES } from "../routes/paths";
import type { Group, Payment } from "../types";
import type { ApiErrorResponse } from "../services/apiClient";

export const PaymentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const groupId = searchParams.get("groupId");
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalSheets, setTotalSheets] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Record Modal state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Selected payment sheet ID for details modal
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch Group Metadata
  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      return;
    }

    let isMounted = true;
    setIsLoadingGroup(true);

    const fetchGroupInfo = async () => {
      try {
        const response = await getGroupByIdApi(groupId);
        if (isMounted) {
          setGroup(response.data || null);
        }
      } catch (err) {
        console.error("Failed to fetch group info for payments:", err);
      } finally {
        if (isMounted) setIsLoadingGroup(false);
      }
    };

    fetchGroupInfo();

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  // Fetch Payments History
  const fetchPaymentsHistory = useCallback(async () => {
    if (!groupId) {
      setPayments([]);
      setTotalSheets(0);
      setTotalPages(1);
      return;
    }

    setIsLoadingPayments(true);
    setError(null);

    try {
      const response = await getGroupPaymentsApi(groupId, {
        page: currentPage,
        limit: 10,
      });

      setPayments(response.data || []);
      setTotalSheets(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr?.status === 401) {
        setError("انتهت جلسة العمل أو غير مصرح، يرجى إعادة تسجيل الدخول.");
      } else if (apiErr?.status === 404) {
        setError("لم يتم العثور على المجموعة المطلوبة.");
      } else {
        setError(apiErr?.message || "حدث خطأ أثناء تحميل سجل المدفوعات.");
      }
    } finally {
      setIsLoadingPayments(false);
    }
  }, [groupId, currentPage]);

  useEffect(() => {
    fetchPaymentsHistory();
  }, [fetchPaymentsHistory]);

  const handlePageChange = (newPage: number) => {
    if (!groupId) return;
    setSearchParams({ groupId, page: newPage.toString() });
  };

  const handleRecordSuccess = (msg: string) => {
    triggerToast(msg);
    fetchPaymentsHistory();
  };

  // Missing Group Guidance State
  if (!groupId) {
    return (
      <div className="space-y-6 text-right max-w-4xl mx-auto" dir="rtl">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center my-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-[#4F8A70]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            سجل المصاريف والمدفوعات الدراسية
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
            يمكنك متابعة الطلاب المتأخرين عن السداد عبر كافة المجموعات مباشرة، أو اختيار مجموعة محددة لعرض كشوفاتها الشهرية.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(ROUTES.PAYMENTS_UNPAID)}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold px-6 py-3.5 rounded-2xl text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>كشف الطلاب غير المسددين (جميع المجموعات)</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.GROUPS)}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-6 py-3.5 rounded-2xl text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>اختيار مجموعة محددة</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
          <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Header Card */}
      <PaymentHeaderCard
        group={group}
        totalSheets={totalSheets}
        isLoading={isLoadingGroup}
        onOpenRecordModal={() => setIsRecordModalOpen(true)}
      />

      {/* Payments History List */}
      <PaymentHistoryList
        payments={payments}
        isLoading={isLoadingPayments}
        onViewDetails={(paymentId) => setSelectedPaymentId(paymentId)}
        onOpenRecordModal={() => setIsRecordModalOpen(true)}
      />

      {/* Pagination */}
      <PaymentPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        groupId={groupId}
        groupName={group?.name || "المجموعة الحالية"}
        existingPayments={payments}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={handleRecordSuccess}
      />

      {/* Details Modal */}
      <PaymentDetailsModal
        isOpen={Boolean(selectedPaymentId)}
        paymentId={selectedPaymentId}
        groupId={groupId}
        onClose={() => setSelectedPaymentId(null)}
      />
    </div>
  );
};
