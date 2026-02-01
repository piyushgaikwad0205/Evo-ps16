import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Smartphone, Lock, ArrowRight, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import PhoneAuthComponent from '../components/auth/PhoneAuthComponent';
import phoneAuthService from '../services/phoneAuthService';
import Banner from '../assets/Campus-Connects.png';

/**
 * Enhanced OTP Verification Page
 * Supports both Email OTP and Phone SMS OTP
 */
const EnhancedOTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [method, setMethod] = useState('email'); // 'email' | 'phone'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);

    // Get email from navigation state
    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // Redirect to signup if no email provided
            navigate('/signup');
        }
    }, [location, navigate]);

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    // Format timer display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle OTP input
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`email-otp-${index + 1}`)?.focus();
        }

        // Auto-submit when all digits entered
        if (index === 5 && value && newOtp.every((digit) => digit)) {
            setTimeout(() => {
                handleVerifyEmailOTP({ preventDefault: () => { } });
            }, 100);
        }
    };

    // Handle OTP paste
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setOtp(newOtp);

        // Auto-submit if complete
        if (pastedData.length === 6) {
            setTimeout(() => {
                handleVerifyEmailOTP({ preventDefault: () => { } });
            }, 100);
        }
    };

    // Verify Email OTP
    const handleVerifyEmailOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const otpCode = otp.join('');

            if (otpCode.length !== 6) {
                throw new Error('Please enter complete 6-digit OTP');
            }

            const result = await phoneAuthService.verifyOTP(email, otpCode);

            console.log('✅ Email OTP verified successfully');
            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/signin', {
                    state: { message: 'Account verified successfully! Please login.' }
                });
            }, 2000);
        } catch (error) {
            console.error('❌ Error verifying email OTP:', error);
            setError(error.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend Email OTP
    const handleResendEmailOTP = async () => {
        setError('');
        setLoading(true);

        try {
            await phoneAuthService.requestOTP({ email, method: 'email' });
            setOtp(['', '', '', '', '', '']);
            setTimer(300);
            setCanResend(false);
            console.log('✅ OTP resent successfully');
        } catch (error) {
            console.error('❌ Error resending OTP:', error);
            setError(error.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    // Handle Phone Auth Success
    const handlePhoneAuthSuccess = async ({ firebaseToken, phoneNumber }) => {
        setLoading(true);
        try {
            const result = await phoneAuthService.verifyPhoneToken(firebaseToken, phoneNumber);

            console.log('✅ Phone authentication successful');

            // Store session token
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            // Redirect to home
            setTimeout(() => {
                navigate('/home');
            }, 1500);
        } catch (error) {
            console.error('❌ Error with phone authentication:', error);
            setError(error.message || 'Phone authentication failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-6">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                {/* Left Section - Branding */}
                <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 p-12">
                    <motion.img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        src={Banner}
                        alt="Campus Connect"
                        className="w-48 drop-shadow-2xl mb-6"
                    />
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white text-4xl font-bold tracking-wide text-center mb-4"
                    >
                        Verify Your Account
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white opacity-90 text-center text-lg max-w-md"
                    >
                        Choose your preferred verification method to complete your registration
                    </motion.p>
                </div>

                {/* Right Section - Verification */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    {/* Method Selection */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Choose Verification Method
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setMethod('email')}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${method === 'email'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                    }`}
                            >
                                <Mail className={`w-6 h-6 ${method === 'email' ? 'text-orange-500' : 'text-gray-400'}`} />
                                <span className={`font-semibold ${method === 'email' ? 'text-orange-500' : 'text-gray-600'}`}>
                                    Email OTP
                                </span>
                            </button>

                            <button
                                onClick={() => setMethod('phone')}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${method === 'phone'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                    }`}
                            >
                                <Smartphone className={`w-6 h-6 ${method === 'phone' ? 'text-orange-500' : 'text-gray-400'}`} />
                                <span className={`font-semibold ${method === 'phone' ? 'text-orange-500' : 'text-gray-600'}`}>
                                    Phone SMS
                                </span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Email OTP Verification */}
                        {method === 'email' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {success ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: 'spring' }}
                                            className="flex items-center justify-center mb-6"
                                        >
                                            <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-full">
                                                <CheckCircle className="w-16 h-16 text-white" />
                                            </div>
                                        </motion.div>

                                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                            Verification Successful!
                                        </h2>
                                        <p className="text-gray-500 mb-6">
                                            Your account has been verified
                                        </p>

                                        <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                                            <Loader className="w-5 h-5 animate-spin" />
                                            <span>Redirecting to login...</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-center mb-6">
                                            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-full">
                                                <Lock className="w-8 h-8 text-white" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                                            Enter Email OTP
                                        </h3>
                                        <p className="text-gray-500 text-center mb-6">
                                            We sent a 6-digit code to <span className="font-semibold">{email}</span>
                                        </p>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                                            >
                                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                <span>{error}</span>
                                            </motion.div>
                                        )}

                                        <form onSubmit={handleVerifyEmailOTP}>
                                            <div className="flex gap-2 justify-center mb-6">
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        id={`email-otp-${index}`}
                                                        type="text"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onPaste={index === 0 ? handleOtpPaste : undefined}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Backspace' && !digit && index > 0) {
                                                                document.getElementById(`email-otp-${index - 1}`)?.focus();
                                                            }
                                                        }}
                                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                                                    />
                                                ))}
                                            </div>

                                            <div className="text-center mb-4">
                                                {canResend ? (
                                                    <button
                                                        type="button"
                                                        onClick={handleResendEmailOTP}
                                                        disabled={loading}
                                                        className="text-orange-500 font-semibold hover:underline disabled:opacity-50"
                                                    >
                                                        Resend OTP
                                                    </button>
                                                ) : (
                                                    <p className="text-gray-500 text-sm">
                                                        Code expires in <span className="font-semibold text-orange-500">{formatTime(timer)}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading || otp.some((digit) => !digit)}
                                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader className="w-5 h-5 animate-spin" />
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        Verify Email OTP
                                                        <ArrowRight className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* Phone SMS Verification */}
                        {method === 'phone' && (
                            <motion.div
                                key="phone"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <PhoneAuthComponent
                                    onSuccess={handlePhoneAuthSuccess}
                                    onError={(error) => setError(error.message)}
                                    mode="verify"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default EnhancedOTPVerification;
