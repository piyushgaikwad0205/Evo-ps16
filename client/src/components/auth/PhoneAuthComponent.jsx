import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../config/firebase.config';
import { Phone, Lock, ArrowRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PhoneAuthComponent - Beautiful Firebase Phone Authentication
 * Supports instant SMS delivery with OTP verification
 */
const PhoneAuthComponent = ({ onSuccess, onError, mode = 'login' }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'success'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Initialize reCAPTCHA
    useEffect(() => {
        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(
                    'recaptcha-container',
                    {
                        size: 'invisible',
                        callback: () => {
                            console.log('✅ reCAPTCHA verified');
                        },
                        'expired-callback': () => {
                            console.log('⚠️ reCAPTCHA expired');
                            setError('reCAPTCHA expired. Please try again.');
                        },
                    },
                    auth
                );
            } catch (error) {
                console.error('❌ reCAPTCHA initialization error:', error);
            }
        }

        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    // Timer for resend OTP
    useEffect(() => {
        if (step === 'otp' && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timer === 0) {
            setCanResend(true);
        }
    }, [step, timer]);

    // Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const fullPhoneNumber = `${countryCode}${phoneNumber}`;

            // Validate phone number
            if (phoneNumber.length < 10) {
                throw new Error('Please enter a valid phone number');
            }

            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);

            setConfirmationResult(confirmation);
            setStep('otp');
            setTimer(60);
            setCanResend(false);
            console.log('✅ OTP sent successfully');
        } catch (error) {
            console.error('❌ Error sending OTP:', error);
            setError(error.message || 'Failed to send OTP. Please try again.');

            // Reset reCAPTCHA
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const otpCode = otp.join('');

            if (otpCode.length !== 6) {
                throw new Error('Please enter complete 6-digit OTP');
            }

            const result = await confirmationResult.confirm(otpCode);
            const user = result.user;

            // Get Firebase ID token
            const firebaseToken = await user.getIdToken();
            const phoneNumber = user.phoneNumber;

            console.log('✅ Phone verified successfully');
            setStep('success');

            // Call success callback with token
            if (onSuccess) {
                onSuccess({ firebaseToken, phoneNumber, user });
            }
        } catch (error) {
            console.error('❌ Error verifying OTP:', error);
            setError('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }

        // Auto-submit when all digits entered
        if (index === 5 && value && newOtp.every((digit) => digit)) {
            setTimeout(() => {
                handleVerifyOTP({ preventDefault: () => { } });
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
                handleVerifyOTP({ preventDefault: () => { } });
            }, 100);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setOtp(['', '', '', '', '', '']);
        setTimer(60);
        setCanResend(false);
        setStep('phone');
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div id="recaptcha-container"></div>

            <AnimatePresence mode="wait">
                {/* Step 1: Phone Number Input */}
                {step === 'phone' && (
                    <motion.div
                        key="phone"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-2xl shadow-xl p-8"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-full">
                                <Phone className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                            {mode === 'login' ? 'Phone Login' : 'Verify Phone'}
                        </h2>
                        <p className="text-gray-500 text-center mb-6">
                            Enter your phone number to receive OTP
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

                        <form onSubmit={handleSendOTP}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                    >
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+44">🇬🇧 +44</option>
                                        <option value="+61">🇦🇺 +61</option>
                                        <option value="+81">🇯🇵 +81</option>
                                    </select>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                        placeholder="1234567890"
                                        required
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phoneNumber.length < 10}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send OTP
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Step 2: OTP Verification */}
                {step === 'otp' && (
                    <motion.div
                        key="otp"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-2xl shadow-xl p-8"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-full">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                            Enter OTP
                        </h2>
                        <p className="text-gray-500 text-center mb-6">
                            We sent a code to {countryCode} {phoneNumber}
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

                        <form onSubmit={handleVerifyOTP}>
                            <div className="flex gap-2 justify-center mb-6">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onPaste={index === 0 ? handleOtpPaste : undefined}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !digit && index > 0) {
                                                document.getElementById(`otp-${index - 1}`)?.focus();
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
                                        onClick={handleResendOTP}
                                        className="text-orange-500 font-semibold hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                ) : (
                                    <p className="text-gray-500 text-sm">
                                        Resend OTP in <span className="font-semibold text-orange-500">{timer}s</span>
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
                                        Verify OTP
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <button
                            onClick={() => setStep('phone')}
                            className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium"
                        >
                            Change Phone Number
                        </button>
                    </motion.div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="flex items-center justify-center mb-6"
                        >
                            <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-full">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Verification Successful!
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Your phone number has been verified
                        </p>

                        <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                            <CheckCircle className="w-5 h-5" />
                            <span>Redirecting...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PhoneAuthComponent;
