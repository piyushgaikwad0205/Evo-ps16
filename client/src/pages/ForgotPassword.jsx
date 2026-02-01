import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiEnvelope, HiLockClosed, HiArrowLeft, HiCheckCircle } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../redux/api/utils";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await API.post("/users/forgot-password", { email });
            setStep(2);
            setSuccess("Verification code sent to your email.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await API.post("/users/reset-password", { email, code, newPassword });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
            >
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {step === 1 ? "Forgot Password?" : step === 2 ? "Reset Password" : "Password Reset!"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {step === 1
                            ? "Enter your email address and we'll send you a code to reset your password."
                            : step === 2
                                ? "Enter the verification code sent to your email and your new password."
                                : "Your password has been successfully reset."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="mt-8 space-y-6"
                            onSubmit={handleSendCode}
                        >
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div className="relative">
                                    <HiEnvelope className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        required
                                        className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70"
                                >
                                    {loading ? "Sending..." : "Send Verification Code"}
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="mt-8 space-y-6"
                            onSubmit={handleResetPassword}
                        >
                            {success && <p className="text-green-500 text-sm text-center">{success}</p>}

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm text-center tracking-widest text-lg"
                                        placeholder="Enter 6-digit Code"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <HiLockClosed className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        required
                                        className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70"
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </div>
                            <div className="text-center">
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-orange-600 hover:text-orange-500">
                                    Change Email
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 text-center space-y-6"
                        >
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                                <HiCheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <p className="text-gray-600">You can now sign in with your new password.</p>
                            <button
                                onClick={() => navigate("/signin")}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Sign In
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {step !== 3 && (
                    <div className="text-center mt-4">
                        <Link to="/signin" className="font-medium text-orange-600 hover:text-orange-500 flex items-center justify-center gap-2">
                            <HiArrowLeft className="w-4 h-4" /> Back to Sign In
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
