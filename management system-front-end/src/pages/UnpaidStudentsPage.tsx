import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Users,
  RefreshCw,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Filter,
  CheckCircle,
  Calendar,
  ExternalLink,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import {
  fetchAllGroupsPaymentsData,
  filterUnpaidStudents,
  filterPaidStudents,
  formatArabicMonth,
  getCurrentMonth,
  recordPaymentApi,
  type UnpaidStudentItem,
  type GroupUnpaidBundle,
} from "../features/payments";
import { QuickAddStudentModal } from "../features/students/components";
import { matchesSearch } from "../utils/searchUtils";
import { ROUTES } from "../routes/paths";

const LEVEL_LABELS: Record<string, string> = {
  prep_third: "الصف الثالث الإعدادي",
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

const getTodayFormattedDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const UnpaidStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: "unpaid" | "paid"
  const currentTab = searchParams.get("tab") === "paid" ? "paid" : "unpaid";

  const handleTabChange = (newTab: "unpaid" | "paid") => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set("tab", newTab);
      return nextParams;
    });
  };

  const [bundles, setBundles] = useState<GroupUnpaidBundle[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Pay confirmation modal / action state
  const [payingStudent, setPayingStudent] = useState<UnpaidStudentItem | null>(null);
  const [isSubmittingPay, setIsSubmittingPay] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Add Student Modal
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAllGroupsPaymentsData();
      setBundles(res.bundles);
      setAvailableMonths(res.availableMonths);
      if (res.availableMonths.length > 0 && !res.availableMonths.includes(selectedMonth)) {
        setSelectedMonth(res.availableMonths[0]);
      }
    } catch (err: any) {
      console.error("Failed to load payments data:", err);
      setError("تعذر تحميل بيانات المدفوعات من الخادم. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract raw unpaid list for selected month
  const rawUnpaidList = useMemo(() => {
    return filterUnpaidStudents(bundles, selectedMonth);
  }, [bundles, selectedMonth]);

  // Extract raw paid list for selected month
  const rawPaidList = useMemo(() => {
    return filterPaidStudents(bundles, selectedMonth);
  }, [bundles, selectedMonth]);

  // Filter groups available for selected level
  const filteredGroupsList = useMemo(() => {
    if (selectedLevel === "all") return bundles.map((b) => b.group);
    return bundles
      .filter((b) => b.group.level === selectedLevel)
      .map((b) => b.group);
  }, [bundles, selectedLevel]);

  // Filtered unpaid students
  const filteredUnpaidStudents = useMemo(() => {
    return rawUnpaidList.filter((item) => {
      if (selectedLevel !== "all" && item.groupLevel !== selectedLevel) return false;
      if (selectedGroup !== "all" && item.groupId !== selectedGroup) return false;
      if (searchQuery.trim()) {
        const matches = matchesSearch(
          searchQuery,
          item.studentName,
          item.studentPhone,
          item.parentPhone,
          item.groupName
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [rawUnpaidList, selectedLevel, selectedGroup, searchQuery]);

  // Filtered paid students
  const filteredPaidStudents = useMemo(() => {
    return rawPaidList.filter((item) => {
      if (selectedLevel !== "all" && item.groupLevel !== selectedLevel) return false;
      if (selectedGroup !== "all" && item.groupId !== selectedGroup) return false;
      if (searchQuery.trim()) {
        const matches = matchesSearch(
          searchQuery,
          item.studentName,
          item.studentPhone,
          item.parentPhone,
          item.groupName
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [rawPaidList, selectedLevel, selectedGroup, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalUnpaid = filteredUnpaidStudents.length;
    const totalPaid = filteredPaidStudents.length;
    const affectedGroupsSet = new Set(filteredUnpaidStudents.map((s) => s.groupId));
    const totalGroups = bundles.length;
    return {
      totalUnpaid,
      totalPaid,
      affectedGroupsCount: affectedGroupsSet.size,
      totalGroups,
    };
  }, [filteredUnpaidStudents, filteredPaidStudents, bundles]);

  // Quick Pay Handler
  const handleConfirmPay = async () => {
    if (!payingStudent) return;
    try {
      setIsSubmittingPay(true);
      await recordPaymentApi(payingStudent.groupId, {
        studentID: payingStudent.studentId,
        month: payingStudent.month,
        isPaid: true,
        paidAt: getTodayFormattedDate(),
      });

      showToast(`تم تسجيل سداد الطالب (${payingStudent.studentName}) بنجاح لشهر ${formatArabicMonth(payingStudent.month)}`);
      setPayingStudent(null);
      loadData();
    } catch (err: any) {
      console.error("Pay error:", err);
      alert("تعذر تسجيل السداد، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const currentDisplayCount = currentTab === "unpaid" ? filteredUnpaidStudents.length : filteredPaidStudents.length;

  return (
    <div className="space-y-6 pb-16 text-right max-w-7xl mx-auto px-2 sm:px-4" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate(ROUTES.PAYMENTS)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer shrink-0 print:hidden"
                title="العودة لصفحة المدفوعات"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-6 rounded-full ${currentTab === "unpaid" ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {currentTab === "unpaid" ? "كشف الطلاب غير المسددين" : "كشف الطلاب المسددين"} (جميع المجموعات)
                </h1>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium mr-11">
              {currentTab === "unpaid"
                ? "حصر شامل وتفصيلي للطلاب المتأخرين عن سداد المصروفات الدراسية لشهر "
                : "حصر شامل ومفصل للطلاب المسددين للمصروفات الدراسية لشهر "}
              <span className={`font-bold px-2 py-0.5 rounded-md border ${
                currentTab === "unpaid"
                  ? "text-rose-700 bg-rose-50 border-rose-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
              }`}>
                {selectedMonth === "all" ? "جميع الشهور المسجلة" : formatArabicMonth(selectedMonth)}
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap print:hidden">
            {/* Quick Add Student Button */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="bg-[#367ab8] hover:bg-[#2c6599] text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ إضافة طالب جديد</span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.PAYMENTS)}
              className="bg-emerald-50 hover:bg-emerald-100 text-[#4F8A70] border border-emerald-200 font-extrabold px-4 py-2.5 rounded-2xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>كشوفات المجموعات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        {/* Unpaid Card */}
        <div
          onClick={() => handleTabChange("unpaid")}
          className={`bg-white border rounded-3xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            currentTab === "unpaid"
              ? "border-rose-400 ring-2 ring-rose-200 shadow-md"
              : "border-rose-200/80 hover:border-rose-300"
          }`}
        >
          <div>
            <span className="text-[11px] font-extrabold text-rose-600 block mb-1">الطلاب غير المسددين</span>
            <span className="text-2xl font-black text-rose-950">{stats.totalUnpaid} طالب</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Paid Card */}
        <div
          onClick={() => handleTabChange("paid")}
          className={`bg-white border rounded-3xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            currentTab === "paid"
              ? "border-emerald-400 ring-2 ring-emerald-200 shadow-md"
              : "border-emerald-200/80 hover:border-emerald-300"
          }`}
        >
          <div>
            <span className="text-[11px] font-extrabold text-emerald-600 block mb-1">الطلاب المسددين</span>
            <span className="text-2xl font-black text-emerald-950">{stats.totalPaid} طالب</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Month Info Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 block mb-1">الشهر المستهدف</span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {selectedMonth === "all" ? "جميع الشهور" : formatArabicMonth(selectedMonth)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-2xl max-w-md print:hidden">
        <button
          onClick={() => handleTabChange("unpaid")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            currentTab === "unpaid"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <span>كشف غير المسددين</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            currentTab === "unpaid" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"
          }`}>
            {filteredUnpaidStudents.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("paid")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            currentTab === "paid"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <span>كشف المسددين</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            currentTab === "paid" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
          }`}>
            {filteredPaidStudents.length}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Month Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
            <span className="text-xs font-extrabold text-slate-500 shrink-0 ml-1">الشهر:</span>
            {availableMonths.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  selectedMonth === m
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {formatArabicMonth(m)}
              </button>
            ))}
            <button
              onClick={() => setSelectedMonth("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                selectedMonth === "all"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              جميع الشهور
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              placeholder="ابحث باسم الطالب، الهاتف، أو المجموعة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-8 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#4F8A70] focus:ring-4 focus:ring-[#4F8A70]/15 transition-all placeholder:text-slate-400 font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Secondary Level & Group Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">تصفية حسب:</span>
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setSelectedGroup("all");
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#4F8A70]"
          >
            <option value="all">كل المراحل الدراسية</option>
            <option value="prep_third">الصف الثالث الإعدادي</option>
            <option value="first">الصف الأول الثانوي</option>
            <option value="second">الصف الثاني الثانوي</option>
            <option value="third">الصف الثالث الثانوي</option>
          </select>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#4F8A70] max-w-[200px]"
          >
            <option value="all">كل المجموعات ({filteredGroupsList.length})</option>
            {filteredGroupsList.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          <span className="text-xs font-extrabold text-slate-400 mr-auto">
            العدد المعروض: {currentDisplayCount} طالب
          </span>
        </div>
      </div>

      {/* Main Table / State */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#4F8A70] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">جارٍ جلب وفحص كشوفات المدفوعات لجميع المجموعات...</p>
        </div>
      ) : currentTab === "unpaid" ? (
        /* UNPAID STUDENTS VIEW */
        filteredUnpaidStudents.length === 0 ? (
          <div className="bg-white border border-emerald-200/90 rounded-3xl p-12 text-center my-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-[#4F8A70]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {searchQuery.trim()
                ? "لا توجد نتائج مطابقة لبحثك"
                : "ممتاز! لا يوجد أي طلاب متأخرين عن السداد"}
            </h3>
            <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
              {searchQuery.trim()
                ? `لم يتم العثور على طالب يطابق "${searchQuery}" ضمن المتأخرين.`
                : `جميع الطلاب مسددون بالكامل لشهر ${
                    selectedMonth === "all" ? "جميع الشهور المحددة" : formatArabicMonth(selectedMonth)
                  }.`}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs print:border-none print:shadow-none">
            {/* Print Only Header */}
            <div className="hidden print:block p-4 border-b border-slate-200 mb-2">
              <h2 className="text-xl font-black text-slate-900">
                كشف الطلاب غير المسددين - {selectedMonth === "all" ? "كافة الشهور" : formatArabicMonth(selectedMonth)}
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1">
                تاريخ الطباعة: {getTodayFormattedDate()} | إجمالي الطلاب غير المسددين: {filteredUnpaidStudents.length}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-slate-50/90 border-b border-slate-100 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4 text-center w-12 shrink-0">#</th>
                    <th className="py-3.5 px-4 min-w-[180px]">اسم الطالب</th>
                    <th className="py-3.5 px-4 min-w-[150px]">المجموعة / المرحلة</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px]">هاتف الطالب</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px]">هاتف ولي الأمر</th>
                    <th className="py-3.5 px-4 text-center min-w-[110px]">الشهر</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px]">حالة السداد</th>
                    <th className="py-3.5 px-4 text-center min-w-[130px] print:hidden">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredUnpaidStudents.map((item, index) => {
                    const levelTitle = LEVEL_LABELS[item.groupLevel] || item.groupLevel;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400 w-12">{index + 1}</td>

                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-sm">{item.studentName}</div>
                        </td>

                        {/* Group and Level */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-extrabold text-slate-800 text-xs">{item.groupName}</span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {levelTitle}
                            </span>
                          </div>
                        </td>

                        {/* Student Phone */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 dir-ltr">
                          {item.studentPhone || "-"}
                        </td>

                        {/* Parent Phone */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 dir-ltr">
                          {item.parentPhone || "-"}
                        </td>

                        {/* Month */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-slate-100 text-slate-700 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">
                            {formatArabicMonth(item.month)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-black px-2.5 py-1 rounded-lg inline-block">
                            {item.statusText}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Quick Pay Button */}
                            <button
                              onClick={() => setPayingStudent(item)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-[#4F8A70] border border-emerald-200 font-extrabold px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                              title="تسجيل سداد هذا الشهر للطالب"
                            >
                              تسديد
                            </button>

                            {/* Link to Group Payments */}
                            <button
                              onClick={() => navigate(`${ROUTES.PAYMENTS}?groupId=${item.groupId}`)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="فتح كشف مدفوعات المجموعة"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* PAID STUDENTS VIEW */
        filteredPaidStudents.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center my-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {searchQuery.trim()
                ? "لا توجد نتائج مطابقة لبحثك في كشف المسددين"
                : "لم يتم العثور على طلاب مسددين لهذا الشهر بعد"}
            </h3>
            <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
              {searchQuery.trim()
                ? `لم يتم العثور على طالب يطابق "${searchQuery}" ضمن المسددين.`
                : `لم يتم تسجيل أي مدفوعات لشهر ${
                    selectedMonth === "all" ? "جميع الشهور" : formatArabicMonth(selectedMonth)
                  } حتى الآن.`}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs print:border-none print:shadow-none">
            {/* Print Only Header */}
            <div className="hidden print:block p-4 border-b border-slate-200 mb-2">
              <h2 className="text-xl font-black text-slate-900">
                كشف الطلاب المسددين - {selectedMonth === "all" ? "كافة الشهور" : formatArabicMonth(selectedMonth)}
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1">
                تاريخ الطباعة: {getTodayFormattedDate()} | إجمالي الطلاب المسددين: {filteredPaidStudents.length}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-slate-50/90 border-b border-slate-100 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4 text-center w-12 shrink-0">#</th>
                    <th className="py-3.5 px-4 min-w-[180px]">اسم الطالب</th>
                    <th className="py-3.5 px-4 min-w-[150px]">المجموعة / المرحلة</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px]">هاتف الطالب</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px]">هاتف ولي الأمر</th>
                    <th className="py-3.5 px-4 text-center min-w-[110px]">الشهر</th>
                    <th className="py-3.5 px-4 text-center min-w-[110px]">حالة السداد</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px]">تاريخ السداد</th>
                    <th className="py-3.5 px-4 text-center min-w-[100px] print:hidden">الكشف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredPaidStudents.map((item, index) => {
                    const levelTitle = LEVEL_LABELS[item.groupLevel] || item.groupLevel;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400 w-12">{index + 1}</td>

                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-sm">{item.studentName}</div>
                        </td>

                        {/* Group and Level */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-extrabold text-slate-800 text-xs">{item.groupName}</span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {levelTitle}
                            </span>
                          </div>
                        </td>

                        {/* Student Phone */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 dir-ltr">
                          {item.studentPhone || "-"}
                        </td>

                        {/* Parent Phone */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 dir-ltr">
                          {item.parentPhone || "-"}
                        </td>

                        {/* Month */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-slate-100 text-slate-700 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">
                            {formatArabicMonth(item.month)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>تم السداد</span>
                          </span>
                        </td>

                        {/* PaidAt Date */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 text-[11px]">
                          {item.paidAt || "مسجل"}
                        </td>

                        {/* Link to Group Payments */}
                        <td className="py-3.5 px-4 text-center print:hidden">
                          <button
                            onClick={() => navigate(`${ROUTES.PAYMENTS}?groupId=${item.groupId}`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                            title="فتح كشف مدفوعات المجموعة"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>عرض</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Quick Pay Confirmation Modal */}
      {payingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 text-right space-y-4 animate-in fade-in zoom-in-95 duration-200"
            dir="rtl"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#4F8A70] flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">تأكيد سداد المصروفات</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                هل تريد تأكيد سداد الطالب{" "}
                <span className="font-extrabold text-slate-900">({payingStudent.studentName})</span> لشهر{" "}
                <span className="font-extrabold text-[#4F8A70]">
                  ({formatArabicMonth(payingStudent.month)})
                </span>{" "}
                بمجموعة ({payingStudent.groupName})؟
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmittingPay}
                onClick={handleConfirmPay}
                className="flex-1 bg-[#4F8A70] hover:bg-[#3f705b] text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPay ? "جارٍ الحفظ..." : "نعم، تأكيد السداد"}
              </button>
              <button
                type="button"
                disabled={isSubmittingPay}
                onClick={() => setPayingStudent(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Student Modal */}
      <QuickAddStudentModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={(name, group) => {
          showToast(`تمت إضافة الطالب (${name}) بنجاح إلى (${group})`);
          loadData();
        }}
      />
    </div>
  );
};
