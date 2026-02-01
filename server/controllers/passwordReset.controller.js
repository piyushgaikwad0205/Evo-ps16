const User = require("../models/user.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Create email transporter
const createTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return null;
};

/**
 * Request password reset - sends OTP to email
 * @route POST /users/forgot-password
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists for security
            return res.json({ message: "If the email exists, a reset code has been sent" });
        }

        // Generate 6-digit OTP
        const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const resetOTPExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save OTP to user
        user.resetPasswordOTP = resetOTP;
        user.resetPasswordExpiry = resetOTPExpiry;
        await user.save();

        // Send email
        const transporter = createTransporter();
        if (transporter) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset - Campus Connect',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>You requested to reset your password for Campus Connect.</p>
                    <p>Your reset code is: <strong>${resetOTP}</strong></p>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Password reset OTP sent to ${email}`);
        } else {
            console.log(`[DEV MODE] Password reset OTP for ${email}: ${resetOTP}`);
        }

        res.json({ message: "If the email exists, a reset code has been sent" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Error processing request" });
    }
};

/**
 * Verify OTP for password reset
 * @route POST /users/verify-reset-otp
 */
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpiry) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        // Check if OTP expired
        if (new Date() > user.resetPasswordExpiry) {
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpiry = undefined;
            await user.save();
            return res.status(400).json({ message: "Reset code has expired" });
        }

        // Verify OTP
        if (user.resetPasswordOTP !== otp) {
            return res.status(400).json({ message: "Invalid reset code" });
        }

        // Generate reset token for next step
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordOTP = undefined; // Clear OTP after verification
        await user.save();

        res.json({
            message: "OTP verified successfully",
            resetToken
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ message: "Error verifying code" });
    }
};

/**
 * Reset password with token
 * @route POST /users/reset-password
 */
const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: resetToken,
            resetPasswordExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Update password
        user.password = newPassword; // Will be hashed by pre-save hook
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        user.resetPasswordOTP = undefined;
        await user.save();

        console.log(`Password reset successful for ${email}`);

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Error resetting password" });
    }
};

module.exports = {
    forgotPassword,
    verifyResetOTP,
    resetPassword
};
