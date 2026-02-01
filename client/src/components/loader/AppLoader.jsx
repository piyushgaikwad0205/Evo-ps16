import React from 'react';
import { useTheme } from "../../contexts/ThemeContext";

const AppLoader = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center w-full transition-colors duration-200">
            <div className="flex flex-col items-center">
                <div className="w-48 h-1 bg-black/10 dark:bg-white/20 rounded-full overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-full w-1/2 bg-black dark:bg-white rounded-full animate-[loadingBar_1.5s_ease-in-out_infinite] shadow-[0_0_10px_rgba(0,0,0,0.3)] dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                </div>
                <style>{`
          @keyframes loadingBar {
            0% { left: -50%; width: 30%; }
            50% { left: 25%; width: 50%; }
            100% { left: 100%; width: 30%; }
          }
        `}</style>
            </div>
        </div>
    );
};

export default AppLoader;
