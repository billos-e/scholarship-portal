import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin, requireStudentSession, sessionDisplayName } from "@/lib/auth/session";
import NotFound from "@/pages/not-found";

import LoginPage from "@/app/login/page";
import AdminDashboard from "@/app/admin/page";
import AdminImport from "@/app/admin/import/page";
import AdminRequests from "@/app/admin/requests/page";
import AdminRequestDetail from "@/app/admin/requests/[id]/page";
import AdminStudents from "@/app/admin/students/page";
import AdminStudentDetail from "@/app/admin/students/[id]/page";
import AdminStudentEdit from "@/app/admin/students/[id]/edit/page";
import AdminUniversities from "@/app/admin/universities/page";
import AdminUniversityDetail from "@/app/admin/universities/[id]/page";
import AdminUniversityEdit from "@/app/admin/universities/[id]/edit/page";

import StudentDashboard from "@/app/student/page";
import StudentProfile from "@/app/student/profile/page";
import StudentProfileEdit from "@/app/student/profile/edit/page";
import StudentSubmit from "@/app/student/submit/page";
import StudentHistory from "@/app/student/history/page";
import StudentHistoryDetail from "@/app/student/history/[id]/page";
import HistoryLayout from "@/app/student/history/layout";

const queryClient = new QueryClient();

function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = requireAdmin();
  return (
    <AppShell variant="admin" email={user.email ?? ""}>
      {children}
    </AppShell>
  );
}

function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = requireStudentSession();
  return (
    <AppShell variant="student" email={user.email ?? ""} displayName={sessionDisplayName(user)}>
      {children}
    </AppShell>
  );
}

function Routes() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/login" />
      </Route>
      <Route path="/login" component={LoginPage} />

      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/import">
        <AdminLayout>
          <AdminImport />
        </AdminLayout>
      </Route>
      <Route path="/admin/requests">
        <AdminLayout>
          <AdminRequests />
        </AdminLayout>
      </Route>
      <Route path="/admin/requests/:id">
        <AdminLayout>
          <AdminRequestDetail />
        </AdminLayout>
      </Route>
      <Route path="/admin/students">
        <AdminLayout>
          <AdminStudents />
        </AdminLayout>
      </Route>
      <Route path="/admin/students/:id">
        <AdminLayout>
          <AdminStudentDetail />
        </AdminLayout>
      </Route>
      <Route path="/admin/students/:id/edit">
        <AdminLayout>
          <AdminStudentEdit />
        </AdminLayout>
      </Route>
      <Route path="/admin/universities">
        <AdminLayout>
          <AdminUniversities />
        </AdminLayout>
      </Route>
      <Route path="/admin/universities/:id">
        <AdminLayout>
          <AdminUniversityDetail />
        </AdminLayout>
      </Route>
      <Route path="/admin/universities/:id/edit">
        <AdminLayout>
          <AdminUniversityEdit />
        </AdminLayout>
      </Route>

      <Route path="/student">
        <StudentLayout>
          <StudentDashboard />
        </StudentLayout>
      </Route>
      <Route path="/student/profile">
        <StudentLayout>
          <StudentProfile />
        </StudentLayout>
      </Route>
      <Route path="/student/profile/edit">
        <StudentLayout>
          <StudentProfileEdit />
        </StudentLayout>
      </Route>
      <Route path="/student/submit">
        <StudentLayout>
          <StudentSubmit />
        </StudentLayout>
      </Route>
      <Route path="/student/history">
        <StudentLayout>
          <HistoryLayout>
            <StudentHistory />
          </HistoryLayout>
        </StudentLayout>
      </Route>
      <Route path="/student/history/:id">
        <StudentLayout>
          <HistoryLayout>
            <StudentHistoryDetail />
          </HistoryLayout>
        </StudentLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Routes />
        </WouterRouter>
        <Toaster richColors position="top-center" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
