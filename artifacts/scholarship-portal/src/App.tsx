import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/app-shell";
import { NavigationLoadingProvider } from "@/components/layout/navigation-loading";
import { getCurrentUser, sessionDisplayName } from "@/lib/auth/session";
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
import AdminSettingsPage from "@/pages/AdminSettingsPage";

import StudentDashboard from "@/app/student/page";
import StudentProfile from "@/app/student/profile/page";
import StudentProfileEdit from "@/app/student/profile/edit/page";
import StudentSubmit from "@/app/student/submit/page";
import StudentHistory from "@/app/student/history/page";
import StudentHistoryDetail from "@/app/student/history/[id]/page";
import HistoryLayout from "@/app/student/history/layout";

const queryClient = new QueryClient();

import { useEffect } from "react";
import { useLocation } from "wouter";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function useRequireRole(role: "ADMIN" | "STUDENT") {
  const [, navigate] = useLocation();
  const user = getCurrentUser();
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== role) {
      navigate(user.role === "ADMIN" ? "/admin" : "/student");
    }
  }, [user, navigate, role]);
  return user;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useRequireRole("ADMIN");
  if (!user || user.role !== "ADMIN") return null;
  return (
    <AppShell variant="admin" email={user.email ?? ""}>
      {children}
    </AppShell>
  );
}

function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = useRequireRole("STUDENT");
  if (!user || user.role !== "STUDENT") return null;
  return (
    <AppShell variant="student" email={user.email ?? ""} displayName={sessionDisplayName(user)}>
      {children}
    </AppShell>
  );
}

function Routes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
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
        <Route path="/admin/settings">
          <AdminLayout>
            <AdminSettingsPage />
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
    </ClerkProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NavigationLoadingProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Routes />
          </WouterRouter>
        </NavigationLoadingProvider>
        <Toaster richColors position="top-center" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
