import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Printer,
  Search,
  Users,
  Layers,
  CheckCircle2,
  Award,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  CreditCard
} from "lucide-react";
import { getLevelReportApi } from "../features/reports/api";
import type {
  LevelReportResponseData,
  StudentLevelReportItem,
  LevelGroupSummary,
  StudentExamResult,
  StudentPaymentRecord,
} from "../features/reports/types";
import type { AcademicLevel } from "../types";
import { ROUTES } from "../routes/paths";

const LEVEL_TITLES: Record<AcademicLevel, string> = {
  prep_third: "الصف الثالث الإعدادي",
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

export const LevelReportPage: React.FC = () => {
  const { level } = useParams<{ level: AcademicLevel }>();
  const navigate = useNavigate();

  const currentLevel: AcademicLevel = (level && LEVEL_TITLES[level]) ? level : "third";
  const levelTitle = LEVEL_TITLES[currentLevel] || "الصف الدراسي";

  const [data, setData] = useState<LevelReportResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getLevelReportApi(currentLevel);
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل بيانات التقرير الشامل");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    setSearchTerm("");
    setSelectedGroup("all");
    setExpandedStudentId(null);
  }, [currentLevel]);

  const filteredStudents = useMemo<StudentLevelReportItem[]>(() => {
    if (!data?.students) return [];

    return data.students.filter((student: StudentLevelReportItem) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        student.parentPhone.includes(searchTerm);

      const matchesGroup =
        selectedGroup === "all" || student.groupId === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [data, searchTerm, selectedGroup]);

  const toggleExpand = (studentId: string) => {
    setExpandedStudentId((prev) => (prev === studentId ? null : studentId));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 text-right dir-rtl max-w-7xl mx-auto px-2 sm:px-4" dir="rtl">
      
      {/* Top Header Navigation */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-[#367ab8] text-slate-600 hover:text-white transition-all active:scale-95 shrink-0"
            title="العودة للرئيسية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#367ab8]"></span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                التقرير الشامل - {levelTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
              تقرير تفصيلي تجميعي لكافة المجموعات والطلاب، الحضور والغياب، والامتحانات والاشتراكات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={isLoading || !!error}
            className="bg-[#367ab8] hover:bg-[#2c6599] active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <RefreshCw className="w-12 h-12 text-[#367ab8] animate-spin" />
          <p className="text-slate-600 font-bold text-base">جاري تجميع وحساب بيانات التقرير الشامل...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xs">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">تعذر تحميل التقرير</h3>
          <p className="text-xs text-slate-500 font-semibold">{error}</p>
          <button
            onClick={fetchReport}
            className="bg-[#367ab8] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-[#2c6599] transition-all shadow-md"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : data ? (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 bg-blue-50 text-[#367ab8] rounded-2xl flex items-center justify-center shrink-0 font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">إجمالي الطلاب</p>
                <h4 className="text-xl sm:text-2xl font-black text-slate-800">{data.summary.totalStudents} طالب</h4>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">عدد المجموعات</p>
                <h4 className="text-xl sm:text-2xl font-black text-slate-800">{data.summary.totalGroups} مجموعات</h4>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">متوسط الحضور</p>
                <h4 className="text-xl sm:text-2xl font-black text-indigo-700">{data.summary.overallAttendanceAvg}%</h4>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">متوسط الامتحانات</p>
                <h4 className="text-xl sm:text-2xl font-black text-amber-700">{data.summary.overallExamAvg}%</h4>
              </div>
            </div>

          </div>

          {/* Search & Group Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم الطالب أو رقم الهاتف..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#367ab8] focus:bg-white transition-all"
              />
            </div>

            {/* Group Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-extrabold text-slate-500 shrink-0">تصفية المجموعة:</span>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#367ab8] focus:bg-white transition-all"
              >
                <option value="all">جميع المجموعات ({data.students.length} طالب)</option>
                {data.summary.groups.map((g: LevelGroupSummary) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.studentCount} طالب)
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* 📱 Mobile & Tablet View: Optimized Cards */}
          <div className="block lg:hidden space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 font-bold text-sm">
                لا يوجد طلاب مطابقين لخيارات البحث
              </div>
            ) : (
              filteredStudents.map((student: StudentLevelReportItem, idx: number) => {
                const isExpanded = expandedStudentId === student._id;

                return (
                  <div
                    key={student._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 transition-all hover:border-[#367ab8]/30"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-slate-100 text-slate-500 rounded-md flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <h3 className="text-base font-black text-slate-900">{student.name}</h3>
                        </div>
                        <span className="inline-block mt-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-slate-200/60">
                          {student.groupName}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleExpand(student._id)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <span>{isExpanded ? "إخفاء" : "تفاصيل"}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Phones */}
                    {(student.phone || student.parentPhone) && (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-semibold dir-ltr justify-end bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                        {student.phone && (
                          <span className="flex items-center gap-1">
                            <span>📱 {student.phone}</span>
                          </span>
                        )}
                        {student.parentPhone && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <span>👨‍👦 {student.parentPhone}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Indicators Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      
                      {/* Attendance */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                        <span className="text-[11px] font-bold text-slate-400 mb-1">الـحـضـور</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-black ${
                            student.attendance.percentage >= 85
                              ? "bg-emerald-100 text-emerald-800"
                              : student.attendance.percentage >= 60
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {student.attendance.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">
                          {student.attendance.attendedSessions}/{student.attendance.totalGroupSessions} حصة
                        </span>
                      </div>

                      {/* Payments */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                        <span className="text-[11px] font-bold text-slate-400 mb-1">الـدغـفـع</span>
                        <span className="bg-blue-50 text-[#367ab8] border border-blue-200/60 px-2 py-0.5 rounded-full text-xs font-black">
                          {student.payments.paidMonthsCount} أشهر
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">مسددة</span>
                      </div>

                      {/* Exams */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                        <span className="text-[11px] font-bold text-slate-400 mb-1">الإمـتـحـانـات</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-black ${
                            student.exams.averagePercentage >= 85
                              ? "bg-indigo-100 text-indigo-800"
                              : student.exams.averagePercentage >= 65
                              ? "bg-sky-100 text-sky-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {student.exams.averagePercentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">
                          {student.exams.totalStudentMarks}/{student.exams.totalPossibleMarks}
                        </span>
                      </div>

                    </div>

                    {/* Expanded Mobile Details */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                        {/* Exams */}
                        <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                          <h5 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-500" />
                            سجل الامتحانات والنتائج ({student.exams.examsCount})
                          </h5>
                          {student.exams.results.length === 0 ? (
                            <p className="text-slate-400 text-xs font-medium">لا توجد امتحانات مسجلة</p>
                          ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {student.exams.results.map((res: StudentExamResult, rIdx: number) => (
                                <div
                                  key={rIdx}
                                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 text-xs font-semibold"
                                >
                                  <span className="text-slate-800 font-bold">{res.examTitle}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-[10px]">{res.date}</span>
                                    <span className="font-extrabold text-[#367ab8]">
                                      {res.marks} / {res.maxMarks}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Payments */}
                        <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                          <h5 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-emerald-500" />
                            الأشهر المدفوعة ({student.payments.paidMonthsCount})
                          </h5>
                          {student.payments.paidMonths.length === 0 ? (
                            <p className="text-slate-400 text-xs font-medium">لم يتم تسجيل أي مدفوعات</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {student.payments.paidMonths.map((pItem: StudentPaymentRecord, pIdx: number) => (
                                <span
                                  key={pIdx}
                                  className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg font-bold text-[11px]"
                                >
                                  شهر {pItem.month} ({pItem.paidAt})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 💻 Desktop View: Spacious Full Table */}
          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-black">
                    <th className="p-4 pr-6">#</th>
                    <th className="p-4">اسم الطالب</th>
                    <th className="p-4">المجموعة</th>
                    <th className="p-4">الهاتف / ولي الأمر</th>
                    <th className="p-4 text-center">نسبة الحضور</th>
                    <th className="p-4 text-center">أشهر الدفع</th>
                    <th className="p-4 text-center">متوسط الامتحانات</th>
                    <th className="p-4 text-center print:hidden">تفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 font-bold">
                        لا يوجد طلاب مطابقين لخيارات البحث
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student: StudentLevelReportItem, idx: number) => {
                      const isExpanded = expandedStudentId === student._id;

                      return (
                        <React.Fragment key={student._id}>
                          <tr className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 pr-6 text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-4 font-black text-slate-900 text-base">{student.name}</td>
                            <td className="p-4">
                              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200/60">
                                {student.groupName}
                              </span>
                            </td>
                            <td className="p-4 dir-ltr text-right">
                              <div className="flex flex-col text-xs text-slate-600 font-bold">
                                {student.phone && <span>📱 {student.phone}</span>}
                                {student.parentPhone && <span className="text-slate-400 font-normal">👨‍👦 {student.parentPhone}</span>}
                              </div>
                            </td>

                            {/* Attendance */}
                            <td className="p-4 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-black ${
                                    student.attendance.percentage >= 85
                                      ? "bg-emerald-100 text-emerald-800"
                                      : student.attendance.percentage >= 60
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {student.attendance.percentage}%
                                </span>
                                <span className="text-xs text-slate-400 font-medium mt-1">
                                  {student.attendance.attendedSessions} من {student.attendance.totalGroupSessions} حصة
                                </span>
                              </div>
                            </td>

                            {/* Payments */}
                            <td className="p-4 text-center">
                              <span className="bg-blue-50 text-[#367ab8] border border-blue-200/60 px-3.5 py-1.5 rounded-full text-xs font-black">
                                {student.payments.paidMonthsCount} أشهر مدفوعة
                              </span>
                            </td>

                            {/* Exams */}
                            <td className="p-4 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-black ${
                                    student.exams.averagePercentage >= 85
                                      ? "bg-indigo-100 text-indigo-800"
                                      : student.exams.averagePercentage >= 65
                                      ? "bg-sky-100 text-sky-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {student.exams.averagePercentage}%
                                </span>
                                <span className="text-xs text-slate-400 font-medium mt-1">
                                  {student.exams.totalStudentMarks} / {student.exams.totalPossibleMarks} درجة
                                </span>
                              </div>
                            </td>

                            {/* Expand Button */}
                            <td className="p-4 text-center print:hidden">
                              <button
                                onClick={() => toggleExpand(student._id)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                title="عرض التفاصيل والامتحانات"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                          </tr>

                          {/* Desktop Expanded Row Details */}
                          {isExpanded && (
                            <tr className="bg-slate-50/90 border-t border-b border-slate-200/80 print:table-row">
                              <td colSpan={8} className="p-6">
                                <div className="grid grid-cols-2 gap-6 text-xs">
                                  
                                  {/* Exams Detail */}
                                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                                    <h5 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                                      <Award className="w-5 h-5 text-amber-500" />
                                      سجل الامتحانات والدرجات التفصيلية ({student.exams.examsCount})
                                    </h5>
                                    {student.exams.results.length === 0 ? (
                                      <p className="text-slate-400 font-medium">لا توجد امتحانات مسجلة</p>
                                    ) : (
                                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {student.exams.results.map((res: StudentExamResult, rIdx: number) => (
                                          <div
                                            key={rIdx}
                                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 font-semibold"
                                          >
                                            <span className="text-slate-800 font-bold">{res.examTitle}</span>
                                            <div className="flex items-center gap-3">
                                              <span className="text-slate-400 text-xs">{res.date}</span>
                                              <span className="font-black text-[#367ab8] text-sm">
                                                {res.marks} / {res.maxMarks}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Payments Detail */}
                                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                                    <h5 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                                      <CreditCard className="w-5 h-5 text-emerald-500" />
                                      الأشهر المدفوعة التفصيلية ({student.payments.paidMonthsCount})
                                    </h5>
                                    {student.payments.paidMonths.length === 0 ? (
                                      <p className="text-slate-400 font-medium">لم يتم تسجيل أي مدفوعات</p>
                                    ) : (
                                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                                        {student.payments.paidMonths.map((pItem: StudentPaymentRecord, pIdx: number) => (
                                          <span
                                            key={pIdx}
                                            className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-xl font-bold text-xs"
                                          >
                                            شهر {pItem.month} ({pItem.paidAt})
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
};
