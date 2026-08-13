import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroupByIdApi, getGroupStudentsApi } from "../features/groups/api";
import { addStudentToGroupApi, deleteStudentApi } from "../features/students/api";
import { getGroupAttendanceApi } from "../features/attendance/api";
import { getGroupPaymentsApi, getPaymentByIdApi } from "../features/payments/api";
import {
  GroupHeaderCard,
  StudentControlBar,
  StudentTable,
  StudentFormModal,
  DeleteStudentModal,
} from "../features/students/components";
import { TakeAttendanceModal } from "../features/attendance/components";
import { RecordPaymentModal } from "../features/payments/components";
import { ROUTES } from "../routes/paths";
import type { Group, User, AttendanceSheet, Payment } from "../types";
import type { ApiErrorResponse } from "../services/apiClient";

export const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();


  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceSheets, setAttendanceSheets] = useState<AttendanceSheet[]>([]);
  const [paymentSheets, setPaymentSheets] = useState<Payment[]>([]);

  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");


  const [activeTab, setActiveTab] = useState<"attendance" | "payments">("attendance");


  const [toastMessage, setToastMessage] = useState<string | null>(null);


  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingStudent, setDeletingStudent] = useState<User | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);


  const [isTakeAttendanceModalOpen, setIsTakeAttendanceModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);

  const fetchGroupDetails = async () => {
    if (!id) return;
    setIsGroupLoading(true);
    setError(null);

    try {
      const response = await getGroupByIdApi(id);
      setGroup(response.data || null);
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      setError(apiErr?.message || "تعذر تحميل بيانات المجموعة المطلوبة.");
    } finally {
      setIsGroupLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!id) return;
    setIsStudentsLoading(true);

    try {
      const response = await getGroupStudentsApi(id);
      setStudents(response.data || []);
    } catch (err: any) {
      console.error("Fetch group students error:", err);
    } finally {
      setIsStudentsLoading(false);
    }
  };

  const fetchAttendanceSheets = async () => {
    if (!id) return;

    try {
      const response = await getGroupAttendanceApi(id, { page: 1, limit: 20 });
      setAttendanceSheets(response.data || []);
    } catch (err: any) {
      console.error("Fetch group attendance error:", err);
    }
  };

  const fetchPaymentSheets = useCallback(async () => {
    if (!id) return;

    try {
      const response = await getGroupPaymentsApi(id, { page: 1, limit: 20 });
      const sheets = response.data || [];


      const detailedSheets = await Promise.all(
        sheets.map(async (sheet) => {
          try {
            const detailRes = await getPaymentByIdApi(sheet._id);
            return detailRes.data || sheet;
          } catch {
            return sheet;
          }
        })
      );

      setPaymentSheets(detailedSheets);
    } catch (err: any) {
      console.error("Fetch group payments error:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchGroupDetails();
    fetchStudents();
    fetchAttendanceSheets();
    fetchPaymentSheets();
  }, [id, fetchPaymentSheets]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.phone && s.phone.includes(query)) ||
        (s.parentPhone && s.parentPhone.includes(query))
    );
  }, [students, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setStudentName("");
    setStudentPhone("");
    setParentPhone("");
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (student: User) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentPhone(student.phone || "");
    setParentPhone(student.parentPhone || "");
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleStudentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setFormError(null);

    if (!studentName.trim()) {
      setFormError("اسم الطالب مطلوب");
      return;
    }

    if (studentPhone.trim() && parentPhone.trim() && parentPhone.trim() === studentPhone.trim()) {
      setFormError("رقم هاتف ولي الأمر يجب أن يختلف عن رقم الطالب");
      return;
    }

    setIsSavingStudent(true);

    try {
      if (editingStudent) {
        setStudents((prev) =>
          prev.map((s) =>
            s._id === editingStudent._id
              ? { ...s, name: studentName.trim(), phone: studentPhone.trim(), parentPhone: parentPhone.trim() || undefined }
              : s
          )
        );
        showToast("تم تعديل بيانات الطالب بنجاح");
      } else {
        await addStudentToGroupApi(id, {
          name: studentName.trim(),
          phone: studentPhone.trim() || undefined,
          parentPhone: parentPhone.trim() || undefined,
        });
        showToast("تمت إضافة الطالب للمجموعة بنجاح");
        fetchStudents();
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr.message?.includes("Duplicate") || apiErr.status === 400) {
        setFormError("رقم الهاتف أو الاسم مسجل مسبقاً، الرجاء التحقق من البيانات.");
      } else {
        setFormError(apiErr?.message || "حدث خطأ أثناء حفظ بيانات الطالب.");
      }
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleDeleteStudentConfirm = async () => {
    if (!deletingStudent) return;
    setIsDeletingStudent(true);
    setDeleteError(null);

    try {
      await deleteStudentApi(deletingStudent._id);
      showToast("تم تحديث حالة الطالب بنجاح");
      setDeletingStudent(null);
      fetchStudents();
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      setDeleteError(apiErr?.message || "تعذر تعديل حالة الطالب.");
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (isGroupLoading) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded-full w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded-full w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-3xl text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error || "المجموعة غير موجودة"}</span>
          </div>
          <button
            onClick={() => navigate(ROUTES.GROUPS)}
            className="bg-white text-rose-700 border border-rose-300 hover:bg-rose-100 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
          >
            العودة للمجموعات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-bold animate-bounce">
          <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}


      <GroupHeaderCard group={group} onOpenAddStudentModal={handleOpenAddModal} />


      <StudentControlBar
        totalStudents={students.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenRecordPaymentModal={() => setIsRecordPaymentModalOpen(true)}
      />


      <StudentTable
        students={filteredStudents}
        isLoading={isStudentsLoading}
        searchQuery={searchQuery}
        attendanceSheets={attendanceSheets}
        paymentSheets={paymentSheets}
        viewMode={activeTab}
        onEdit={handleOpenEditModal}
        onDelete={setDeletingStudent}
        onOpenAddModal={handleOpenAddModal}
      />


      <StudentFormModal
        isOpen={isFormModalOpen}
        editingStudent={editingStudent}
        name={studentName}
        phone={studentPhone}
        parentPhone={parentPhone}
        isSubmitting={isSavingStudent}
        error={formError}
        onNameChange={setStudentName}
        onPhoneChange={setStudentPhone}
        onParentPhoneChange={setParentPhone}
        onSubmit={handleStudentFormSubmit}
        onClose={() => setIsFormModalOpen(false)}
      />


      <DeleteStudentModal
        deletingStudent={deletingStudent}
        isDeleting={isDeletingStudent}
        error={deleteError}
        onConfirm={handleDeleteStudentConfirm}
        onClose={() => {
          setDeletingStudent(null);
          setDeleteError(null);
        }}
      />


      <TakeAttendanceModal
        isOpen={isTakeAttendanceModalOpen}
        groupId={id || null}
        groupName={group?.name || ""}
        onSuccess={(msg) => {
          showToast(msg);
          fetchAttendanceSheets();
        }}
        onClose={() => setIsTakeAttendanceModalOpen(false)}
      />


      <RecordPaymentModal
        isOpen={isRecordPaymentModalOpen}
        groupId={id || null}
        groupName={group?.name || ""}
        existingPayments={paymentSheets}
        onClose={() => setIsRecordPaymentModalOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          fetchPaymentSheets();
        }}
      />
    </div>
  );
};
