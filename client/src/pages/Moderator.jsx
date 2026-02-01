import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CommonLoading from "../components/loader/CommonLoading";
import MainSection from "../components/moderator/MainSection";
import ModeratorsList from "../components/moderator/ModeratorsList";
import { useTheme } from "../contexts/ThemeContext";

const Moderator = () => {
  const navigate = useNavigate();
  const userRole = useSelector((state) => state.auth?.userData?.role);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (userRole !== "moderator") {
      navigate("/access-denied");
    }
  }, [userRole, navigate]);

  if (userRole !== "moderator") {
    return (
      <div className={`flex h-screen items-center justify-center ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MainSection />
        </div>
        <div className="lg:col-span-1">
          <div className={`sticky top-24 rounded-2xl shadow-sm border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"
            }`}>
            <ModeratorsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moderator;
