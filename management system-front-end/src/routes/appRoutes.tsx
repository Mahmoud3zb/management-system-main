import React from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./paths";
import { ProtectedRoute, PublicOnlyRoute } from "./ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";

import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { GroupsPage } from "../pages/GroupsPage";
import { GroupDetailsPage } from "../pages/GroupDetailsPage";
import { AttendancePage } from "../pages/AttendancePage";
import { AttendanceDetailsPage } from "../pages/AttendanceDetailsPage";
import { ExamsPage } from "../pages/ExamsPage";
import { ExamDetailsPage } from "../pages/ExamDetailsPage";
import { PaymentsPage } from "../pages/PaymentsPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />


      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.GROUPS} element={<GroupsPage />} />
          <Route path={ROUTES.GROUP_DETAILS} element={<GroupDetailsPage />} />
          <Route path={ROUTES.ATTENDANCE} element={<AttendancePage />} />
          <Route path={ROUTES.ATTENDANCE_DETAILS} element={<AttendanceDetailsPage />} />
          <Route path={ROUTES.EXAMS} element={<ExamsPage />} />
          <Route path={ROUTES.EXAM_DETAILS} element={<ExamDetailsPage />} />
          <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
        </Route>
      </Route>


      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
