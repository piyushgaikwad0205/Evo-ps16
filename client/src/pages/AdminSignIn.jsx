import React, { useState } from "react";
import { HiEye, HiEyeOff, HiAcademicCap } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signInAction } from "../redux/actions/adminActions";
import logo from "../assets/Campus-Connects.png";
import { Shield, ArrowLeft } from "lucide-react";

export default function AdminSignIn({ onLoginSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signInError = useSelector((state) => state.admin?.signInError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSigningIn(true);

    try {
      await dispatch(signInAction({ username, password }));
      const adminData = localStorage.getItem("admin");
      if (adminData) {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          try {
            const parsed = JSON.parse(adminData);
            if (parsed.user?.role === "superadmin") {
              navigate("/super-admin");
            } else {
              navigate("/admin");
            }
          } catch (e) {
            navigate("/admin");
          }
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-dark-bg relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-500/10 blur-[100px] animate-float" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-5xl bg-white/80 dark:bg-dark-bg-secondary/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-white/20 dark:border-white/5 m-4 z-10">

        {/* Left Logo Section */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-orange-600 p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-white/20">
              <img
                src={logo}
                alt="Campus Connect Logo"
                className="w-24 h-auto drop-shadow-xl"
              />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-white" />
              <h1 className="text-white text-4xl font-bold tracking-tight font-outfit">
                College Portal
              </h1>
            </div>
            <p className="text-purple-100 text-lg max-w-xs font-light">
              Manage and control Campus Connect platform activities.
            </p>
          </div>
        </div>

        {/* Right Admin Form Section */}
        <form onSubmit={handleSubmit} className="flex flex-col justify-center p-8 md:p-12 lg:p-16">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-outfit">Admin Access 🔐</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to the <span className="font-semibold text-purple-600 dark:text-purple-400">Admin Dashboard</span>
            </p>
          </div>

          {/* Error */}
          {signInError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {signInError}
            </div>
          )}

          {/* Username */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Admin Username</label>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all pr-12"
                required
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={signingIn}
            className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 active:scale-[0.98] transition-all duration-200 ${signingIn ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {signingIn ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : "Sign In as Admin"}
          </button>

          {/* Back to user login */}
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-8 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to User Sign In</span>
          </button>

          <Link
            to="/faculty/signin"
            className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mt-4 transition-colors"
          >
            <HiAcademicCap size={16} />
            <span>Faculty Login</span>
          </Link>

        </form>
      </div>
    </div>
  );
}
