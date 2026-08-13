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
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center my-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-[#4F8A70]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">
            عرض سجل المصاريف والمدفوعات الدراسية
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mb-6 leading-relaxed">
            يرجى اختيار مجموعة أولاً من قائمة المجموعات لعرض سجل المدفوعات وكشوفات الشهر الخاصة بها.
          </p>

          <button
            onClick={() => navigate(ROUTES.GROUPS)}
            className="bg-[#4F8A70] hover:bg-[#3f705b] text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md shadow-[#4F8A70]/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>الانتقال لقائمة المجموعات</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
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
        onClose={() => setSelectedPaymentId(null)}
      />
    </div>
  );
};
