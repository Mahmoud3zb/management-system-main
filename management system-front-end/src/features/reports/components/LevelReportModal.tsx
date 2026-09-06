import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  Printer,
  Search,
  Users,
  Layers,
  CheckCircle2,
  Award,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  CreditCard
} from "lucide-react";
import { getLevelReportApi } from "../api";
import type {
  LevelReportResponseData,
  StudentLevelReportItem,
  LevelGroupSummary,
  StudentExamResult,
  StudentPaymentRecord,
} from "../types";
import type { AcademicLevel } from "../../../types";

interface LevelReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: AcademicLevel;
  levelTitle: string;
}

export const LevelReportModal: React.FC<LevelReportModalProps> = ({
  isOpen,
  onClose,
  level,
  levelTitle,
}) => {
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
      const res = await getLevelReportApi(level);
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل التقرير الشامل");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
      setSearchTerm("");
      setSelectedGroup("all");
      setExpandedStudentId(null);
    }
  }, [isOpen, level]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-right" dir="rtl">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#367ab8] to-[#2c6599] text-white p-5 sm:p-6 flex items-center justify-between shadow-sm border-b border-white/10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-amber-300 font-bold shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                التقرير الشامل - {levelTitle}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-medium mt-0.5">
                تقرير تجميعي لحالة الحضور والامتحانات والدفع للمجموعات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isLoading || !!error}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة التقرير</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-10 h-10 text-[#367ab8] animate-spin" />
              <p className="text-slate-600 font-bold text-sm">جاري تحميل بيانات التقرير الشامل...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800">تعذر تحميل التقرير</h3>
              <p className="text-xs text-slate-500 font-semibold">{error}</p>
              <button
                onClick={fetchReport}
                className="bg-[#367ab8] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#2c6599] transition-all shadow-md"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : data ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-50 text-[#367ab8] rounded-xl flex items-center justify-center shrink-0 font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">إجمالي الطلاب</p>
                    <h4 className="text-lg sm:text-xl font-black text-slate-800">{data.summary.totalStudents} طالب</h4>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">عدد المجموعات</p>
                    <h4 className="text-lg sm:text-xl font-black text-slate-800">{data.summary.totalGroups} مجموعات</h4>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">متوسط الحضور</p>
                    <h4 className="text-lg sm:text-xl font-black text-indigo-700">{data.summary.overallAttendanceAvg}%</h4>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">متوسط الامتحانات</p>
                    <h4 className="text-lg sm:text-xl font-black text-amber-700">{data.summary.overallExamAvg}%</h4>
                  </div>
                </div>

              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث باسم الطالب أو رقم الهاتف..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#367ab8] focus:bg-white transition-all"
                  />
                </div>

                {/* Group Selector */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-extrabold text-slate-500 shrink-0">المجموعة:</span>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#367ab8] focus:bg-white transition-all"
                  >
                    <option value="all">جميع المجموعات ({data.students.length})</option>
                    {data.summary.groups.map((g: LevelGroupSummary) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.studentCount})
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Students Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-black">
                        <th className="p-3.5 pr-5">#</th>
                        <th className="p-3.5">اسم الطالب</th>
                        <th className="p-3.5">المجموعة</th>
                        <th className="p-3.5">الهاتف / ولي الأمر</th>
                        <th className="p-3.5 text-center">نسبة الحضور</th>
                        <th className="p-3.5 text-center">أشهر الدفع</th>
                        <th className="p-3.5 text-center">متوسط الامتحانات</th>
                        <th className="p-3.5 text-center print:hidden">تفاصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                            لا يوجد طلاب مطابقين للبحث
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student: StudentLevelReportItem, idx: number) => {
                          const isExpanded = expandedStudentId === student._id;

                          return (
                            <React.Fragment key={student._id}>
                              <tr className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3.5 pr-5 text-slate-400 font-bold">{idx + 1}</td>
                                <td className="p-3.5 font-extrabold text-slate-900">{student.name}</td>
                                <td className="p-3.5">
                                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200/60">
                                    {student.groupName}
                                  </span>
                                </td>
                                <td className="p-3.5 dir-ltr text-right">
                                  <div className="flex flex-col text-xs text-slate-600">
                                    {student.phone && <span>📱 {student.phone}</span>}
                                    {student.parentPhone && <span className="text-slate-400">👨‍👦 {student.parentPhone}</span>}
                                  </div>
                                </td>

                                {/* Attendance */}
                                <td className="p-3.5 text-center">
                                  <div className="inline-flex flex-col items-center">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-xs font-black ${
                                        student.attendance.percentage >= 85
                                          ? "bg-emerald-100 text-emerald-800"
                                          : student.attendance.percentage >= 60
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-rose-100 text-rose-800"
                                      }`}
                                    >
                                      {student.attendance.percentage}%
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                                      {student.attendance.attendedSessions} من {student.attendance.totalGroupSessions} حصة
                                    </span>
                                  </div>
                                </td>

                                {/* Payments */}
                                <td className="p-3.5 text-center">
                                  <span className="bg-blue-50 text-[#367ab8] border border-blue-200/60 px-3 py-1 rounded-full text-xs font-black">
                                    {student.payments.paidMonthsCount} أشهر مدفوعة
                                  </span>
                                </td>

                                {/* Exams */}
                                <td className="p-3.5 text-center">
                                  <div className="inline-flex flex-col items-center">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-xs font-black ${
                                        student.exams.averagePercentage >= 85
                                          ? "bg-indigo-100 text-indigo-800"
                                          : student.exams.averagePercentage >= 65
                                          ? "bg-sky-100 text-sky-800"
                                          : "bg-rose-100 text-rose-800"
                                      }`}
                                    >
                                      {student.exams.averagePercentage}%
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                                      {student.exams.totalStudentMarks} / {student.exams.totalPossibleMarks} درجة
                                    </span>
                                  </div>
                                </td>

                                {/* Expand Button */}
                                <td className="p-3.5 text-center print:hidden">
                                  <button
                                    onClick={() => toggleExpand(student._id)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                    title="عرض التفاصيل والامتحانات"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded Row Details */}
                              {isExpanded && (
                                <tr className="bg-slate-50/90 border-t border-b border-slate-200/80 print:table-row">
                                  <td colSpan={8} className="p-4 sm:p-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                      
                                      {/* Exams Detail */}
                                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                                        <h5 className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                                          <Award className="w-4 h-4 text-amber-500" />
                                          سجل الامتحانات والدرجات ({student.exams.examsCount})
                                        </h5>
                                        {student.exams.results.length === 0 ? (
                                          <p className="text-slate-400 font-medium">لا توجد امتحانات مسجلة</p>
                                        ) : (
                                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                            {student.exams.results.map((res: StudentExamResult, rIdx: number) => (
                                              <div
                                                key={rIdx}
                                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 font-semibold"
                                              >
                                                <span className="text-slate-700">{res.examTitle}</span>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-slate-400 text-[11px]">{res.date}</span>
                                                  <span className="font-extrabold text-[#367ab8]">
                                                    {res.marks} / {res.maxMarks}
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Payments Detail */}
                                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                                        <h5 className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                                          <CreditCard className="w-4 h-4 text-emerald-500" />
                                          الأشهر المدفوعة ({student.payments.paidMonthsCount})
                                        </h5>
                                        {student.payments.paidMonths.length === 0 ? (
                                          <p className="text-slate-400 font-medium">لم يتم تسجيل أي مدفوعات</p>
                                        ) : (
                                          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
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

      </div>
    </div>
  );
};
