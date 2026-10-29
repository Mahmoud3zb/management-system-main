import React, { useEffect, useState } from "react";
import { UserPlus, X, AlertCircle, CheckCircle, GraduationCap } from "lucide-react";
import { getGroupsApi } from "../../groups/api";
import { addStudentToGroupApi } from "../api";
import type { Group, AcademicLevel } from "../../../types";

const LEVEL_LABELS: Record<AcademicLevel | string, string> = {
  prep_third: "الصف الثالث الإعدادي",
  first: "الصف الأول الثانوي",
  second: "الصف الثاني الثانوي",
  third: "الصف الثالث الثانوي",
};

const ORDERED_LEVELS: AcademicLevel[] = ["prep_third", "first", "second", "third"];

export interface QuickAddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (studentName: string, groupName: string) => void;
  initialGroupId?: string;
}

export const QuickAddStudentModal: React.FC<QuickAddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialGroupId,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(false);

  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || "");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [parentPhone, setParentPhone] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load groups when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset form when closed
      setName("");
      setPhone("");
      setParentPhone("");
      setError(null);
      setSuccessMsg(null);
      return;
    }

    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
    }

    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true);
        const res = await getGroupsApi({ limit: 100 });
        const list = res.data || [];
        setGroups(list);
        if (!initialGroupId && list.length > 0 && !selectedGroupId) {
          setSelectedGroupId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load groups for QuickAddStudentModal:", err);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [isOpen, initialGroupId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedGroupId) {
      setError("يرجى اختيار المجموعة التي سينضم إليها الطالب");
      return;
    }

    const cleanName = name.trim();
    if (!cleanName) {
      setError("يرجى إدخال اسم الطالب");
      return;
    }

    try {
      setIsSubmitting(true);
      await addStudentToGroupApi(selectedGroupId, {
        name: cleanName,
        phone: phone.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
      });

      const targetGroup = groups.find((g) => g._id === selectedGroupId);
      const groupName = targetGroup ? targetGroup.name : "المجموعة المحددة";

      setSuccessMsg(`تمت إضافة الطالب (${cleanName}) بنجاح إلى (${groupName})`);
      onSuccess?.(cleanName, groupName);

      // Brief delay so user sees feedback, then close
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("Quick add student error:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "تعذر إضافة الطالب. يرجى التأكد من البيانات والمحاولة مرة أخرى.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-right animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#367ab8]/10 text-[#367ab8] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                إضافة طالب جديد مباشرة
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                إلحاق طالب بأي مجموعة دراسية بدون مغادرة الصفحة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Selector */}
          <div className="space-y-1.5">
            <label htmlFor="quickAddGroup" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#367ab8]" />
              <span>المجموعة المستهدفة</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              id="quickAddGroup"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={isLoadingGroups || isSubmitting}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoadingGroups ? (
                <option value="">جارٍ تحميل المجموعات...</option>
              ) : groups.length === 0 ? (
                <option value="">لا توجد مجموعات متاحة</option>
              ) : (
                ORDERED_LEVELS.map((lvl) => {
                  const levelGroups = groups.filter((g) => g.level === lvl);
                  if (levelGroups.length === 0) return null;
                  return (
                    <optgroup key={lvl} label={`── ${LEVEL_LABELS[lvl] || lvl} ──`}>
                      {levelGroups.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })
              )}
            </select>
          </div>

          {/* Student Name */}
          <div className="space-y-1.5">
            <label htmlFor="quickAddStudentName" className="text-xs font-bold text-slate-700">
              اسم الطالب بالكامل <span className="text-rose-500">*</span>
            </label>
            <input
              id="quickAddStudentName"
              type="text"
              placeholder="مثال: أحمد محمد علي"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all placeholder:text-slate-400 disabled:opacity-50"
            />
          </div>

          {/* Phone Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="quickAddStudentPhone" className="text-xs font-bold text-slate-700">
                رقم هاتف الطالب <span className="text-slate-400 font-normal">(اختياري)</span>
              </label>
              <input
                id="quickAddStudentPhone"
                type="text"
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                disabled={isSubmitting}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 text-left focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="quickAddParentPhone" className="text-xs font-bold text-slate-700">
                رقم هاتف ولي الأمر <span className="text-slate-400 font-normal">(اختياري)</span>
              </label>
              <input
                id="quickAddParentPhone"
                type="text"
                placeholder="01112345678"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                dir="ltr"
                disabled={isSubmitting}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 text-left focus:outline-none focus:bg-white focus:border-[#367ab8] focus:ring-4 focus:ring-[#367ab8]/20 transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingGroups || !selectedGroupId}
              className="flex-1 bg-[#367ab8] hover:bg-[#2c6599] text-white font-extrabold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جارٍ حفظ الطالب...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة الطالب</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
