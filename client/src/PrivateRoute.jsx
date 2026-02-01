import { useMemo, useEffect, useState, useRef } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setInitialAuthState } from "./redux/actions/authActions";
import Navbar from "./components/shared/Navbar";
import Leftbar from "./components/shared/Leftbar";
import Rightbar from "./components/shared/Rightbar";
import MobileBottomNav from "./components/navigation/MobileBottomNav";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "./contexts/ThemeContext";

import ModeratorRightbar from "./components/moderator/Rightbar";

import HomePage from "./pages/Home";


const noRightbarRoutes = [
  /\/post\/[^/]+$/,
  /\/community\/[^/]+\/report$/,
  /\/community\/[^/]+\/reported-post$/,
  /\/community\/[^/]+\/moderator$/,
].map((regex) => new RegExp(regex));

const getStoredProfile = () => {
  try {
    const raw = localStorage.getItem("profile");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};



const PrivateRoute = () => {
  const userData = useSelector((state) => state.auth?.userData);
  const [prevPath, setPrevPath] = useState(null);

  const isAuthenticated = useMemo(() => {
    return (userData, accessToken) => {
      return Boolean(userData) && Boolean(accessToken);
    };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stored = getStoredProfile();
  const accessToken = stored?.accessToken;
  const { isDarkMode } = useTheme();

  const currentUserIsModerator = userData?.role === "moderator";

  // Check if we should skip animation (home <-> profile)
  const shouldSkipAnimation = useMemo(() => {
    const current = location.pathname;
    const prev = prevPath;
    const fastRoutes = ['/home', '/profile'];
    return fastRoutes.includes(current) && fastRoutes.includes(prev);
  }, [location.pathname, prevPath]);

  useEffect(() => {
    setPrevPath(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated(userData, accessToken)) {
      dispatch(setInitialAuthState(navigate));
    }
  }, [dispatch, navigate, userData, accessToken, isAuthenticated]);



  const showRightbar = !noRightbarRoutes.some((regex) =>
    regex.test(location.pathname)
  );

  const [showLeftbar, setShowLeftbar] = useState(false);

  const toggleLeftbar = () => {
    setShowLeftbar(!showLeftbar);
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (showLeftbar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLeftbar]);

  // Define pages that should have custom header instead of navbar
  const customHeaderPages = [
    { path: '/profile', title: 'Profile' },
    { path: '/collabs', title: 'Collab Board' },
    { path: '/surveys', title: 'Surveys' },
    { path: '/clubs', title: 'Clubs' },
    { path: '/alumni-hub', title: 'Alumni Hub' },
    { path: '/saved', title: 'Saved' },
    { path: '/messages', title: 'Messages', hideHeaderMobileOnly: true } // Hide header only on mobile for messages
  ];

  const currentCustomPage = customHeaderPages.find(page => location.pathname === page.path);



  return isAuthenticated(userData, accessToken) ? (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Navbar or Custom Header */}
      {currentCustomPage ? (
        <>
          {/* Desktop: Always show navbar for Messages, custom header for others */}
          {currentCustomPage.hideHeaderMobileOnly ? (
            <div className="hidden md:block">
              <Navbar
                userData={userData}
                toggleLeftbar={toggleLeftbar}
                showLeftbar={showLeftbar}
              />
            </div>
          ) : (
            <div className="hidden md:block">
              <Navbar
                userData={userData}
                toggleLeftbar={toggleLeftbar}
                showLeftbar={showLeftbar}
              />
            </div>
          )}

          {/* Mobile: Show custom header with back arrow (but not for Messages) */}
          {!currentCustomPage.hideHeaderMobileOnly && (
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-white/5 dark:border-white/5 shadow-sm transition-colors duration-200 rounded-b-3xl">
              <div className="flex items-center gap-4 px-4 py-3">
                <button
                  onClick={() => navigate(-1)}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {currentCustomPage.title}
                </h1>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={location.pathname === '/ai' ? "hidden md:block" : ""}>
          <Navbar
            userData={userData}
            toggleLeftbar={toggleLeftbar}
            showLeftbar={showLeftbar}
          />
        </div>
      )}

      {showLeftbar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowLeftbar(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Hide leftbar on mobile for Messages page */}
        {location.pathname !== '/messages' && (
          <div
            className={`${showLeftbar ? 'translate-x-0' : '-translate-x-full'
              } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-[60] lg:z-0 h-screen overflow-hidden transition-transform duration-300 ease-in-out`}
            onClick={(e) => e.stopPropagation()}
          >
            <Leftbar showLeftbar={showLeftbar} />
          </div>
        )}

        {/* Show leftbar on desktop for Messages page */}
        {location.pathname === '/messages' && (
          <div className="hidden lg:block lg:sticky top-0 left-0 z-0 h-screen overflow-hidden">
            <Leftbar showLeftbar={true} />
          </div>
        )}

        <div className={`flex-1 min-w-0 ${location.pathname === '/messages' ? 'pt-0' : location.pathname === '/ai' ? 'pt-0 md:pt-16' : 'pt-16'}`}>
          <div className={`max-w-7xl mx-auto pb-4 md:pb-0 ${location.pathname === '/home' ? '' : location.pathname === '/ai' ? 'md:px-6 md:py-6' : location.pathname === '/messages' ? '' : 'px-4 sm:px-6 lg:px-8 py-6'}`}>
            <Outlet />
          </div>
        </div>

        {showRightbar && (
          <div className="hidden xl:block w-80 flex-shrink-0 pt-16">
            <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-hidden">
              {currentUserIsModerator ? (
                <ModeratorRightbar />
              ) : (
                <Rightbar />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {location.pathname !== '/messages' && <MobileBottomNav />}
    </div>
  ) : (
    <Navigate to="/signin" />
  );
};

export default PrivateRoute;

