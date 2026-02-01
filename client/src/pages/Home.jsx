import { useSelector } from "react-redux";
import MainSection from "../components/home/MainSection";
import { useTheme } from "../contexts/ThemeContext";
const Home = () => {
  const userData = useSelector((state) => state.auth?.userData);
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-white"}`}>
      <MainSection userData={userData} />
    </div>
  );
};

export default Home;
