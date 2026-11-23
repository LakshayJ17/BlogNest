import "./App.css";
import { lazy, ReactNode, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "./store/auth";
import Home from "./pages/Home";
import { Blogs } from "./pages/Blogs";
import { Unauthorized } from "./components/Unauthorized";
import { Spinner } from "./components/Spinner";
import { Wordmark } from "./components/Logo";
import { ErrorBoundary } from "./components/ErrorBoundary";

const named = <T extends Record<string, unknown>>(load: () => Promise<T>, key: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[key] as React.ComponentType })));

const Blog = named(() => import("./pages/Blog"), "Blog");
const Signin = named(() => import("./pages/Signin"), "Signin");
const Signup = named(() => import("./pages/Signup"), "Signup");
const Publish = named(() => import("./pages/Publish"), "Publish");
const Drafts = named(() => import("./pages/Drafts"), "Drafts");
const ProfilePage = named(() => import("./pages/Profile"), "ProfilePage");
const AdminDashboard = named(() => import("./pages/AdminDashboard"), "AdminDashboard");
const NotFound = named(() => import("./pages/NotFound"), "NotFound");

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function FullPageLoader() {
  // The backend host can take a while to wake up; say so instead of spinning silently.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 px-6 text-center">
      <Wordmark className="text-2xl" />
      <Spinner className="text-muted" />
      <p className="font-mono text-xs text-muted">{slow ? "Waking up the server. This can take a few seconds." : "Loading"}</p>
    </div>
  );
}

/** Signed-in writers only. Admins are sent to their dashboard. */
function RequireUser({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Unauthorized />;
  if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;
  return children;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Unauthorized />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function WritersOnly({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "admin") return <Navigate to="/admin-dashboard" replace />;
  return children;
}

/** A crash on one page shouldn't follow the reader to the next one. */
function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}

function App() {
  const { token, user, isLoading, fetchUserData } = useAuthStore();

  useEffect(() => {
    if (token) void fetchUserData();
  }, [token, fetchUserData]);

  // Block only the first load. Later refreshes keep the page mounted.
  if (isLoading && !user) return <FullPageLoader />;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouteErrorBoundary>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/blogs" element={<WritersOnly><Blogs /></WritersOnly>} />
          <Route path="/publish" element={<RequireUser><Publish /></RequireUser>} />
          <Route path="/publish/:id" element={<RequireUser><Publish /></RequireUser>} />
          <Route path="/drafts" element={<RequireUser><Drafts /></RequireUser>} />
          <Route path="/profile" element={<RequireUser><ProfilePage /></RequireUser>} />
          <Route path="/admin-dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </RouteErrorBoundary>

      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
        className="!px-4 !pb-4 sm:!p-0"
      />
    </BrowserRouter>
  );
}

export default App;
