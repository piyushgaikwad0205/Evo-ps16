import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { signInAction } from "../redux/actions/authActions";
import useAppStore from "../store/useAppStore";
import { isUserAuthenticated } from "../utils/authUtils";
import logo from "../assets/Campus-Connects.png";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signInError = useSelector((state) => state.auth?.signInError);
  const successMessage = useSelector((state) => state.auth?.successMessage);

  const storeCurrentUser = useAppStore((state) => state.currentUser);

  // Check if user is already authenticated (from localStorage or cookie)
  useEffect(() => {
    if (storeCurrentUser || isUserAuthenticated()) {
      navigate("/home");
    }
  }, [storeCurrentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await dispatch(signInAction({ email, password }, navigate));
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Campus Connect"
            className="h-16 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Welcome back to Campus Connect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {signInError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
              {signInError}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg border border-green-200 dark:border-green-800">
              {successMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@college.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Are you an Alumni?{" "}
            <Link to="/alumni/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Register Here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
