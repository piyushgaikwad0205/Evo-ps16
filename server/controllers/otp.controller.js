const User = require("../models/user.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { verifyFirebaseToken } = require("../config/firebase.config");

// Email transporter (configure with your SMTP settings)
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Rate limiting storage (in production, use Redis)
const otpRateLimits = new Map();

/**
 * Generate 6-digit OTP code (increased from 4 for better security)
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check rate limit for OTP requests
 * @param {string} identifier - Email or phone number
 * @returns {boolean} - True if within rate limit
 */
const checkRateLimit = (identifier) => {
    const now = Date.now();
    const limit = otpRateLimits.get(identifier);

    if (!limit) {
        otpRateLimits.set(identifier, { count: 1, resetTime: now + 3600000 }); // 1 hour
        return true;
    }

    if (now > limit.resetTime) {
        otpRateLimits.set(identifier, { count: 1, resetTime: now + 3600000 });
        return true;
    }

    if (limit.count >= 3) {
        return false; // Max 3 requests per hour
    }

    limit.count++;
    return true;
};

/**
 * Send OTP via email with enhanced template
 */
const sendOTPEmail = async (email, otp, name) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Campus Connect - Login Verification Code',
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Campus Connect</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 10px;">Hi ${name},</p>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">Your verification code is:</p>
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; text-align: center; border-radius: 12px; margin: 30px 0; border: 2px solid #f59e0b;">
            <div style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #92400e; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            ⏱️ This code will expire in <strong style="color: #f97316;">5 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            🔒 If you didn't request this code, please ignore this email.
          </p>
        </div>
        <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
            This is an automated message from Campus Connect. Please do not reply.
          </p>
        </div>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return false;
    }
};

/**
 * Send OTP via Firebase Phone Authentication
 * Note: Firebase handles SMS delivery automatically on the client side
 * This function is for logging/tracking purposes
 */
const logFirebaseSMS = (phoneNumber, userId) => {
    console.log(`📱 Firebase SMS OTP initiated for ${phoneNumber} (User: ${userId})`);
    return true;
};

/**
 * Request OTP for login (Enhanced with Phone Support)
 * @route POST /auth/request-otp
 */
const requestOTP = async (req, res) => {
    try {
        const { email, phoneNumber, method } = req.body;

        // Validate input
        if (!email && !phoneNumber) {
            return res.status(400).json({ message: "Email or phone number is required" });
        }

        // Determine identifier for rate limiting
        const identifier = email || phoneNumber;

        // Check rate limit
        if (!checkRateLimit(identifier)) {
            return res.status(429).json({
                message: "Too many OTP requests. Please try again later.",
                retryAfter: 3600 // seconds
            });
        }

        // Find user by email or phone
        const query = email ? { email } : { phoneNumber };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to user
        user.otpCode = otp;
        user.otpExpiry = otpExpiry;
        user.otpVerified = false;
        user.otpMethod = method || 'email'; // Track which method was used
        await user.save();

        // Determine delivery method
        const deliveryMethod = method || user.twoFactorMethod || 'email';
        let emailSent = false;
        let smsSent = false;
        let deliveryInfo = {};

        // Send via Email
        if (deliveryMethod === 'email' || deliveryMethod === 'both') {
            emailSent = await sendOTPEmail(user.email, otp, user.name);
            if (emailSent) {
                deliveryInfo.email = user.email;
            }
        }

        // Send via Phone (Firebase handles SMS on client side)
        if (deliveryMethod === 'phone' || deliveryMethod === 'both') {
            if (user.phoneNumber) {
                smsSent = logFirebaseSMS(user.phoneNumber, user._id);
                deliveryInfo.phone = user.phoneNumber;
            } else {
                return res.status(400).json({
                    message: "Phone number not registered. Please add a phone number first."
                });
            }
        }

        if (!emailSent && !smsSent) {
            return res.status(500).json({ message: "Failed to send OTP" });
        }

        res.json({
            message: "OTP sent successfully",
            method: deliveryMethod,
            sentTo: deliveryInfo,
            expiresIn: 300, // 5 minutes in seconds
        });
    } catch (error) {
        console.error('Error requesting OTP:', error);
        res.status(500).json({ message: "Error sending OTP" });
    }
};

/**
 * Verify OTP
 * @route POST /auth/verify-otp
 */
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP exists
        if (!user.otpCode) {
            return res.status(400).json({ message: "No OTP requested. Please request a new OTP." });
        }

        // Check if OTP expired
        if (new Date() > user.otpExpiry) {
            user.otpCode = null;
            user.otpExpiry = null;
            await user.save();
            return res.status(400).json({ message: "OTP expired. Please request a new one." });
        }

        // Verify OTP
        if (user.otpCode !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Mark OTP as verified
        user.otpVerified = true;
        user.otpCode = null; // Clear OTP after verification
        user.otpExpiry = null;
        await user.save();

        res.json({
            message: "OTP verified successfully",
            verified: true,
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: "Error verifying OTP" });
    }
};

/**
 * Enable/Disable 2FA for user
 * @route PATCH /auth/toggle-2fa
 */
const toggle2FA = async (req, res) => {
    try {
        const { enabled, method } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.twoFactorEnabled = enabled;
        if (method) {
            user.twoFactorMethod = method;
        }

        await user.save();

        res.json({
            message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully`,
            twoFactorEnabled: user.twoFactorEnabled,
            twoFactorMethod: user.twoFactorMethod,
        });
    } catch (error) {
        console.error('Error toggling 2FA:', error);
        res.status(500).json({ message: "Error updating 2FA settings" });
    }
};

/**
 * Update mobile number
 * @route PATCH /auth/update-mobile
 */
const updateMobile = async (req, res) => {
    try {
        const { mobile } = req.body;
        const userId = req.userId;

        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({ message: "Valid 10-digit mobile number is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.mobile = mobile;
        await user.save();

        res.json({
            message: "Mobile number updated successfully",
            mobile: user.mobile,
        });
    } catch (error) {
        console.error('Error updating mobile:', error);
        res.status(500).json({ message: "Error updating mobile number" });
    }
};

/**
 * Verify Firebase Phone Token and Login/Register
 * @route POST /auth/phone/verify
 */
const verifyPhoneToken = async (req, res) => {
    try {
        const { firebaseToken, phoneNumber } = req.body;

        if (!firebaseToken || !phoneNumber) {
            return res.status(400).json({
                message: "Firebase token and phone number are required"
            });
        }

        // Verify Firebase token
        let decodedToken;
        try {
            decodedToken = await verifyFirebaseToken(firebaseToken);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired Firebase token",
                error: error.message
            });
        }

        // Verify phone number matches token
        if (decodedToken.phone_number !== phoneNumber) {
            return res.status(400).json({
                message: "Phone number mismatch"
            });
        }

        // Find or create user
        let user = await User.findOne({ phoneNumber });

        if (!user) {
            // Create new user with phone number
            user = new User({
                phoneNumber,
                name: `User_${phoneNumber.slice(-4)}`, // Default name
                phoneVerified: true,
                firebaseUid: decodedToken.uid,
            });
            await user.save();
            console.log(`✅ New user created with phone: ${phoneNumber}`);
        } else {
            // Update existing user
            user.phoneVerified = true;
            user.firebaseUid = decodedToken.uid;
            await user.save();
            console.log(`✅ Existing user verified with phone: ${phoneNumber}`);
        }

        // Generate JWT session token
        const jwt = require('jsonwebtoken');
        const sessionToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: "Phone authentication successful",
            token: sessionToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                phoneVerified: user.phoneVerified,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Error verifying phone token:', error);
        res.status(500).json({
            message: "Error verifying phone authentication",
            error: error.message
        });
    }
};

/**
 * Link Phone Number to Existing Account
 * @route POST /auth/phone/link
 */
const linkPhoneToAccount = async (req, res) => {
    try {
        const { firebaseToken, phoneNumber } = req.body;
        const userId = req.userId; // From auth middleware

        if (!firebaseToken || !phoneNumber) {
            return res.status(400).json({
                message: "Firebase token and phone number are required"
            });
        }

        // Verify Firebase token
        let decodedToken;
        try {
            decodedToken = await verifyFirebaseToken(firebaseToken);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired Firebase token",
                error: error.message
            });
        }

        // Verify phone number matches token
        if (decodedToken.phone_number !== phoneNumber) {
            return res.status(400).json({
                message: "Phone number mismatch"
            });
        }

        // Check if phone is already linked to another account
        const existingUser = await User.findOne({
            phoneNumber,
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Phone number already linked to another account"
            });
        }

        // Update user with phone number
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.phoneNumber = phoneNumber;
        user.phoneVerified = true;
        user.firebaseUid = decodedToken.uid;
        await user.save();

        res.json({
            success: true,
            message: "Phone number linked successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                phoneVerified: user.phoneVerified,
            },
        });
    } catch (error) {
        console.error('Error linking phone to account:', error);
        res.status(500).json({
            message: "Error linking phone number",
            error: error.message
        });
    }
};

module.exports = {
    requestOTP,
    verifyOTP,
    toggle2FA,
    updateMobile,
    verifyPhoneToken,
    linkPhoneToAccount,
};
