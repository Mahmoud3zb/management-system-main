import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getGroupsApi,
  createGroupApi,
  updateGroupApi,
  deleteGroupApi,
} from "../features/groups/api";
import { ROUTES } from "../routes/paths";
import type { Group, AcademicLevel } from "../types";
import type { ApiErrorResponse } from "../services/apiClient";

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

const LEVEL_BADGE_STYLES: Record<AcademicLevel, string> = {
  first: "bg-blue-50 text-blue-700 border-blue-200",
  second: "bg-indigo-50 text-indigo-700 border-indigo-200",
  third: "bg-amber-50 text-amber-700 border-amber-200",
};

export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();


  const currentLevelParam = searchParams.get("level") as AcademicLevel | null;
  const activeLevelFilter: AcademicLevel | "all" =
    currentLevelParam && ["first", "second", "third"].includes(currentLevelParam)
      ? currentLevelParam
      : "all";


  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");


  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGroups, setTotalGroups] = useState(0);


  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formName, setFormName] = useState("");
  const [formLevel, setFormLevel] = useState<AcademicLevel>("first");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);


  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);


  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const levelToFetch = activeLevelFilter === "all" ? undefined : activeLevelFilter;
      const response = await getGroupsApi({
        level: levelToFetch,
        page,
        limit: 12,
      });

      setGroups(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalGroups(response.total || 0);
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      setError(apiErr?.message || "حدث خطأ أثناء تحميل قائمة المجموعات.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [activeLevelFilter, page]);


  const handleLevelTabChange = (level: AcademicLevel | "all") => {
    setPage(1);
    if (level === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ level });
    }
  };


  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    return groups.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [groups, searchQuery]);


  const handleOpenAddModal = () => {
    setEditingGroup(null);
    setFormName("");
    setFormLevel(activeLevelFilter === "all" ? "first" : activeLevelFilter);
    setModalError(null);
    setIsAddEditModalOpen(true);
  };


  const handleOpenEditModal = (group: Group) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormLevel(group.level as AcademicLevel);
    setModalError(null);
    setIsAddEditModalOpen(true);
  };


  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formName.trim()) {
      setModalError("اسم المجموعة مطلوب");
      return;
    }

    if (formName.trim().length < 3) {
      setModalError("اسم المجموعة يجب أن يتكون من 3 أحرف على الأقل");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingGroup) {

        await updateGroupApi(editingGroup._id, {
          name: formName.trim(),
          level: formLevel,
        });
        showToast("تم تعديل المجموعة بنجاح");
      } else {

        await createGroupApi({
          name: formName.trim(),
          level: formLevel,
        });
        showToast("تمت إضافة المجموعة بنجاح");
      }

      setIsAddEditModalOpen(false);
      fetchGroups();
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr.status === 400 && apiErr.message?.includes("already exists")) {
        setModalError("اسم المجموعة مستخدم بالفعل، الرجاء اختيار اسم آخر.");
      } else {
        setModalError(apiErr?.message || "حدث خطأ أثناء تنفيذ العملية.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteGroupApi(deletingGroup._id);
      showToast("تم حذف المجموعة بنجاح");
      setDeletingGroup(null);
      fetchGroups();
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      setDeleteError(apiErr?.message || "تعذر حذف المجموعة. الرجاء المحاولة لاحقاً.");
    } finally {
      setIsDeleting(false);
    }
  };


  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">

      {successMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-bold animate-bounce">
          <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}


      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-amber-400 rounded-full"></span>
            <h1 className="text-xl font-extrabold text-slate-900">إدارة المجموعات</h1>
            <span className="bg-[#367ab8]/10 text-[#367ab8] text-xs font-bold px-2.5 py-1 rounded-full mr-2">
              {totalGroups} مجموعة
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            عرض وتعديل المجموعات الدراسية لجميع المراحل الثانوية
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#367ab8] hover:bg-[#2d679c] active:bg-[#255581] text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-md shadow-[#367ab8]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>إضافة مجموعة جديدة</span>
        </button>
      </div>


      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleLevelTabChange("all")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeLevelFilter === "all"
              ? "bg-[#367ab8] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
          >
            كل المراحل
          </button>
          <button
            onClick={() => handleLevelTabChange("first")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeLevelFilter === "first"
              ? "bg-[#367ab8] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
          >
            الأول الثانوي
          </button>
          <button
            onClick={() => handleLevelTabChange("second")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeLevelFilter === "second"
              ? "bg-[#367ab8] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
          >
            الثاني الثانوي
          </button>
          <button
            onClick={() => handleLevelTabChange("third")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeLevelFilter === "third"
              ? "bg-[#367ab8] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
          >
            الثالث الثانوي
          </button>
        </div>


        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="بحث باسم المجموعة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/15 transition-all placeholder:text-slate-400"
          />
          <svg className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>


      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-3">
          <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}


      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-slate-100 rounded-full w-2/3"></div>
              <div className="h-4 bg-slate-100 rounded-full w-1/3"></div>
              <div className="h-10 bg-slate-100 rounded-2xl w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (

        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center my-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            {searchQuery.trim() ? "لا توجد نتائج مطابقة للبحث" : "لا توجد مجموعات مضافة لهذا الصف حتى الآن"}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1 mb-6">
            {searchQuery.trim()
              ? `لم يتم العثور على مجموعة تحتوي على "${searchQuery}"`
              : "يمكنك البدء بإضافة أول مجموعة دراسية لهذه المرحلة."}
          </p>
          {!searchQuery.trim() && (
            <button
              onClick={handleOpenAddModal}
              className="bg-[#367ab8] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md hover:bg-[#2d679c] transition-all cursor-pointer"
            >
              إضافة مجموعة الآن
            </button>
          )}
        </div>
      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const levelKey = group.level as AcademicLevel;
            const levelLabel = LEVEL_LABELS[levelKey] || group.level;
            const badgeStyle = LEVEL_BADGE_STYLES[levelKey] || "bg-slate-100 text-slate-700";

            return (
              <div
                key={group._id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#367ab8] transition-colors">
                        {group.name}
                      </h3>
                      <span className={`inline-block border text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 ${badgeStyle}`}>
                        {levelLabel}
                      </span>
                    </div>


                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                      نشط
                    </span>
                  </div>
                </div>


                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`${ROUTES.GROUPS}/${group._id}`)}
                    className="bg-slate-100 hover:bg-[#367ab8] hover:text-white text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>فتح المجموعة</span>
                    <svg className="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(group)}
                      className="p-2 text-slate-400 hover:text-[#367ab8] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="تعديل المجموعة"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setDeletingGroup(group)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="حذف المجموعة"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            السابق
          </button>
          <span className="text-xs font-bold text-slate-500 px-3">
            صفحة {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            التالي
          </button>
        </div>
      )}


      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingGroup ? "تعديل بيانات المجموعة" : "إضافة مجموعة جديدة"}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="groupName" className="text-xs font-bold text-slate-700">
                  اسم المجموعة <span className="text-rose-500">*</span>
                </label>
                <input
                  id="groupName"
                  type="text"
                  placeholder="مثال: مجموعة أ - السبت والثلاثاء"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="groupLevel" className="text-xs font-bold text-slate-700">
                  المرحلة الدراسية <span className="text-rose-500">*</span>
                </label>
                <select
                  id="groupLevel"
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value as AcademicLevel)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all"
                >
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#367ab8] hover:bg-[#2d679c] text-white font-bold rounded-xl text-xs shadow-md shadow-[#367ab8]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الحفظ...
                    </span>
                  ) : editingGroup ? (
                    "حفظ التعديلات"
                  ) : (
                    "إضافة المجموعة"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {deletingGroup && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-base font-black text-slate-900">
              هل أنت متأكد من حذف هذه المجموعة؟
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تنبيه: سيتم إلغاء تفعيل المجموعة <span className="font-bold text-slate-800">"{deletingGroup.name}"</span> وتأثير الحسابات المرتبطة وفقاً لنظام الباك إند.
            </p>

            {deleteError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setDeletingGroup(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isDeleting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الحذف...
                  </span>
                ) : (
                  "تأكيد الحذف"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
