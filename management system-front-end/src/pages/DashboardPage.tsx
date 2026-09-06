import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { getGroupsApi, getGroupStudentsApi } from "../features/groups/api";
import { ROUTES } from "../routes/paths";
import type { AcademicLevel } from "../types";

interface SecondaryLevelCard {
  level: AcademicLevel;
  number: number;
  title: string;
  badgeBg: string;
  groupsCount: number;
  studentsCount: number;
  isLoading: boolean;
  error: string | null;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [cardsData, setCardsData] = useState<Record<AcademicLevel, SecondaryLevelCard>>({
    prep_third: {
      level: "prep_third",
      number: 3,
      title: "الصف الثالث الإعدادي",
      badgeBg: "bg-emerald-50 text-emerald-700",
      groupsCount: 0,
      studentsCount: 0,
      isLoading: true,
      error: null,
    },
    first: {
      level: "first",
      number: 1,
      title: "الصف الأول الثانوي",
      badgeBg: "bg-blue-50 text-[#367ab8]",
      groupsCount: 0,
      studentsCount: 0,
      isLoading: true,
      error: null,
    },
    second: {
      level: "second",
      number: 2,
      title: "الصف الثاني الثانوي",
      badgeBg: "bg-sky-50 text-[#367ab8]",
      groupsCount: 0,
      studentsCount: 0,
      isLoading: true,
      error: null,
    },
    third: {
      level: "third",
      number: 3,
      title: "الصف الثالث الثانوي",
      badgeBg: "bg-rose-50 text-[#367ab8]",
      groupsCount: 0,
      studentsCount: 0,
      isLoading: true,
      error: null,
    },
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLevelData = async () => {
      const levels: AcademicLevel[] = ["prep_third", "first", "second", "third"];

      const promises = levels.map(async (lvl) => {
        try {
          const groupsRes = await getGroupsApi({ level: lvl, limit: 100 });
          const groupsList = groupsRes.data || [];
          const groupsCount = groupsRes.total || groupsList.length;

          let studentsCount = 0;
          if (groupsList.length > 0) {
            const studentCounts = await Promise.allSettled(
              groupsList.map((g) => getGroupStudentsApi(g._id))
            );

            studentsCount = studentCounts.reduce((sum, res) => {
              if (res.status === "fulfilled" && Array.isArray(res.value.data)) {
                return sum + res.value.data.length;
              }
              return sum;
            }, 0);
          }

          return {
            level: lvl,
            groupsCount,
            studentsCount,
          };
        } catch (err) {
          return {
            level: lvl,
            groupsCount: 0,
            studentsCount: 0,
          };
        }
      });

      const results = await Promise.all(promises);

      if (!isMounted) return;

      setCardsData((prev) => {
        const next = { ...prev };
        results.forEach((res) => {
          next[res.level] = {
            ...next[res.level],
            groupsCount: res.groupsCount,
            studentsCount: res.studentsCount,
            isLoading: false,
          };
        });
        return next;
      });
    };

    fetchLevelData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (level: AcademicLevel) => {
    navigate(`${ROUTES.GROUPS}?level=${level}`);
  };

  const handleOpenReport = (e: React.MouseEvent, level: AcademicLevel) => {
    e.stopPropagation();
    navigate(`/reports/level/${level}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2 text-right" dir="rtl">

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-amber-400 rounded-full"></span>
          <h2 className="text-xl font-extrabold text-[#367ab8] tracking-tight">
            الصفوف الدراسية
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {(["prep_third", "first", "second", "third"] as AcademicLevel[]).map((levelKey) => {
          const item = cardsData[levelKey];

          return (
            <div
              key={levelKey}
              onClick={() => handleCardClick(levelKey)}
              className="bg-white border border-slate-100/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group hover:border-[#367ab8]/30"
            >
              <div className="flex items-center gap-4 text-right w-full sm:w-auto">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 shadow-xs group-hover:scale-105 transition-transform ${item.badgeBg}`}
                >
                  <span className="bg-[#367ab8] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs shadow-xs">
                    {item.number}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-800 group-hover:text-[#367ab8] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    {item.isLoading ? (
                      <span className="animate-pulse">جاري التحميل...</span>
                    ) : (
                      `${item.groupsCount} مجموعات | ${item.studentsCount} طالب`
                    )}
                  </p>
                </div>
              </div>

              {/* Comprehensive Report Page Navigation Button */}
              <button
                onClick={(e) => handleOpenReport(e, item.level)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#367ab8] hover:bg-[#2c6599] text-white px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 shrink-0 shadow-md hover:shadow-lg"
              >
                <FileText className="w-4 h-4" />
                <span>تقرير شامل</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
