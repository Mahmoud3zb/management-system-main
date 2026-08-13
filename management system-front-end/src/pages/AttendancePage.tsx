import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getGroupByIdApi } from "../features/groups/api";
import { getGroupAttendanceApi } from "../features/attendance/api";
import {
  AttendanceHistoryList,
  AttendancePagination,
  TakeAttendanceModal,
} from "../features/attendance/components";
import { ROUTES } from "../routes/paths";
import type { Group, AttendanceSheet, AcademicLevel } from "../types";
import type { ApiErrorResponse } from "../services/apiClient";

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

const getArabicErrorMessage = (err: any, fallback: string): string => {
  const apiErr = err as ApiErrorResponse;
  if (apiErr?.status === 401) {
    return "انتهت جلسة العمل أو غير مصرح، يرجى إعادة تسجيل الدخول.";
  }
  if (apiErr?.status === 403) {
    return "ليس لديك الصلاحية للوصول إلى هذه البيانات.";
  }
  if (apiErr?.status === 404) {
    return "لم يتم العثور على المجموعة المطلوبة.";
  }
  return apiErr?.message && apiErr.message !== "Unauthorized"
    ? apiErr.message
    : fallback;
};

export const AttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();


  const groupId = searchParams.get("groupId");


  const [group, setGroup] = useState<Group | null>(null);
  const [isGroupLoading, setIsGroupLoading] = useState(false);


  const [sheets, setSheets] = useState<AttendanceSheet[]>([]);
  const [isSheetsLoading, setIsSheetsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const [isTakeAttendanceModalOpen, setIsTakeAttendanceModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);


  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSheets, setTotalSheets] = useState(0);


  useEffect(() => {
    let isMounted = true;

    if (!groupId) {
      setGroup(null);
      setSheets([]);
      setIsGroupLoading(false);
      return;
    }

    const loadTargetGroup = async () => {
      setIsGroupLoading(true);
      setError(null);

      try {
        const groupRes = await getGroupByIdApi(groupId);
        if (isMounted) {
          setGroup(groupRes.data || null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(getArabicErrorMessage(err, "تعذر تحميل بيانات المجموعة."));
        }
      } finally {
        if (isMounted) setIsGroupLoading(false);
      }
    };

    loadTargetGroup();

    return () => {
      isMounted = false;
    };
  }, [groupId]);


  const fetchHistory = useCallback(async () => {
    if (!groupId || !group?._id) return;

    setIsSheetsLoading(true);

    try {
      const response = await getGroupAttendanceApi(group._id, {
        page,
        limit: 10,
      });

      setSheets(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalSheets(response.total || 0);
    } catch (err: any) {
      setError(getArabicErrorMessage(err, "حدث خطأ أثناء تحميل سجلات الغياب."));
    } finally {
      setIsSheetsLoading(false);
    }
  }, [groupId, group?._id, page]);


  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };


  const handleViewDetails = (sheetId: string) => {
    if (groupId) {
      navigate(`/attendance/${sheetId}?groupId=${groupId}`);
    } else {
      navigate(`/attendance/${sheetId}`);
    }
  };


  const handleOpenTakeAttendanceModal = () => {
    if (!groupId) {
      setError("يرجى اختيار مجموعة من صفحة المجموعات أولاً لتسجيل الحصة.");
      return;
    }
    setIsTakeAttendanceModalOpen(true);
  };

  const levelLabel = group ? LEVEL_LABELS[group.level as AcademicLevel] || group.level : "";


  if (!groupId) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center my-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-[#ce5071]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">
            يرجى اختيار مجموعة لمتابعة الغياب والحضور
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mb-6 leading-relaxed">
            لتقويم وحصر سجلات الغياب والحضور، يرجى الانتقال إلى صفحة إدارة المجموعات واختيار المجموعة المطلوبة.
          </p>
          <button
            onClick={() => navigate(ROUTES.GROUPS)}
            className="bg-[#367ab8] hover:bg-[#2d679c] text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md shadow-[#367ab8]/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>الانتقال لصفحة المجموعات</span>
            <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">

      {successToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-bold animate-bounce">
          <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successToast}</span>
        </div>
      )}


      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {group && (
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate(`${ROUTES.GROUPS}/${group._id}`);
                  }
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                title="العودة للصفحة السابقة"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-6 bg-[#ce5071] rounded-full"></span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {isGroupLoading ? "جاري التحميل..." : group ? group.name : "الغياب والحضور"}
                </h1>
                {group && (
                  <span className="bg-rose-50 text-[#ce5071] border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full mr-1">
                    {totalSheets} حصة
                  </span>
                )}
              </div>

              {group && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-blue-50 text-[#367ab8] border border-blue-200 text-xs font-bold px-3 py-0.5 rounded-full">
                    {levelLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenTakeAttendanceModal}
          className="bg-[#ce5071] hover:bg-[#b84361] active:bg-[#a23952] text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-md shadow-[#ce5071]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>تسجيل حصة</span>
        </button>
      </div>


      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>

          {error.includes("انتهت جلسة العمل") && (
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-rose-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      )}


      <AttendanceHistoryList
        sheets={sheets}
        isLoading={isSheetsLoading || isGroupLoading}
        onViewDetails={handleViewDetails}
        onOpenTakeAttendanceModal={handleOpenTakeAttendanceModal}
      />


      <AttendancePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />


      <TakeAttendanceModal
        isOpen={isTakeAttendanceModalOpen}
        groupId={groupId}
        groupName={group?.name || ""}
        onSuccess={(msg) => {
          showToast(msg);
          fetchHistory();
        }}
        onClose={() => setIsTakeAttendanceModalOpen(false)}
      />
    </div>
  );
};
