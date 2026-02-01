/**
 * Project Name: Campus Connects
 * Description: A social networking platform with automated content moderation and context-based authentication system.
 *
 * Author: Neaz Mahmud
 * Email: neaz6160@gmail.com
 * Date: 19th June 2023
 */

import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OnlineUsersProvider } from "./contexts/OnlineUsersContext";
import "./index.css";
import fullscreenManager from "./utils/fullscreen";
import { privateRoutes } from "./routes";
import AlumniRegistration from "./pages/AlumniRegistration";
import usePushNotifications from "./hooks/usePushNotifications";
import AppLoader from "./components/loader/AppLoader";
import PrivateRoute from "./PrivateRoute";

// Lazy load components
const Intro = lazy(() => import("./pages/Intro"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const EmailVerifiedMessage = lazy(() => import("./pages/EmailVerifiedMessage"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const AdminSignIn = lazy(() => import("./pages/AdminSignIn"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const SuperAdminPanel = lazy(() => import("./pages/SuperAdminPanel"));
const FacultySignin = lazy(() => import("./pages/FacultySignin"));
const HODDashboard = lazy(() => import("./pages/HODDashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const StaffDashboard = lazy(() => import("./pages/StaffDashboard"));

// Initialize fullscreen manager for hybrid mobile app
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure DOM is ready
  setTimeout(() => {
    fullscreenManager.init();
  }, 100);
}

function App() {
  usePushNotifications();
  return (
    <ThemeProvider>
      <OnlineUsersProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-200">
              <AppLoader />
            </div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Intro />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/alumni/register" element={<AlumniRegistration />} />
            <Route path="/email-verified" element={<EmailVerifiedMessage />} />
            <Route path="/auth/verify" element={<VerifyEmail />} />
            <Route path="/admin/signin" element={<AdminSignIn />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/super-admin" element={<SuperAdminPanel />} />
            <Route path="/faculty/signin" element={<FacultySignin />} />
            <Route path="/hod/dashboard" element={<HODDashboard />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />

            {/* Private routes */}
            <Route path="/*" element={<PrivateRoute />}>
              {privateRoutes.map((r) => (
                <Route key={r.path} path={r.path.replace(/^\//, "")} element={r.element} />
              ))}
            </Route>
          </Routes>
        </Suspense>
      </OnlineUsersProvider>
    </ThemeProvider>
  );
}

export default App;
