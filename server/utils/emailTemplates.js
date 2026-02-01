const verifyEmailHTML = (name, verificationLink, verificationCode) =>
  `
<div style="max-width: 600px; margin: auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgb(104, 182, 255);">
  <div style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
    <img src="https://drive.google.com/uc?export=view&id=1Qw2w03UgG3318MBozxUjYwFg74xLaRd0" alt="Campus Connects Logo" style="display: block; margin: auto auto 20px;max-width: 50%;" />
    <p style="font-size: 18px; margin-bottom: 20px; text-align: center; color: #4b5563; font-weight: bold;">Welcome to Campus Connects, ${name}!</p>
    <p style="font-size: 16px; margin-bottom: 20px; text-align: center; color: #4b5563;">Please click the button below to verify your email address and activate your account:</p>
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${verificationLink}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; display: inline-block; font-size: 16px; font-weight: bold;">Verify Email Address</a>
   </div>
    <p style="font-size: 14px; margin-bottom: 20px; text-align: center; color: #4b5563;">Please note that the device you are using for this verification process will be set as your primary device.</p>
    <p style="font-size: 14px; margin-bottom: 20px; text-align: center; color: #6b7280;">The link will expire in 30 minutes.</p>
    <p style="font-size: 16px; margin-bottom: 15px; text-align: center; color: #3b82f6; font-weight: bold;">Your verification code is: <span style="color: #000000;">${verificationCode}</span></p>
    <p style="font-size: 14px; margin-bottom: 20px; text-align: center; color: #4b5563;">If you did not create an account, please ignore this email.</p>
   </div>
</div>`;

const verifyLoginHTML = (
  name,
  verificationLink,
  blockLink,
  currentContextData
) => `
  <div style="background-color: #F4F4F4; padding: 20px;">
    <div style="background-color: #fff; padding: 20px; border-radius: 10px;">
      <h1 style="color: black; font-size: 24px; margin-bottom: 20px;">New login attempt detected</h1>
      <p>Dear ${name},</p>
      <p>Our system has detected that a new login was attempted from the following device and location at ${currentContextData.time}:</p>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>IP Address:</strong> ${currentContextData.ip}</li>
        <li><strong>Location:</strong> ${currentContextData.city}, ${currentContextData.country}</li>
        <li><strong>Device:</strong> ${currentContextData.device} ${currentContextData.deviceType}</li>
        <li><strong>Browser:</strong> ${currentContextData.browser}</li>
        <li><strong>Operating System:</strong> ${currentContextData.os}</li>
        <li><strong>Platform:</strong> ${currentContextData.platform}</li>
      </ul>
      <p>If this was you, please click the button below to verify your login:</p>
      <div style="text-align: center;">
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #1da1f2; color: #fff; text-decoration: none; border-radius: 5px; margin-bottom: 20px;">Verify Login</a>
      </div>
      <p>If you believe this was an unauthorized attempt, please click the button below to block this login:</p>
      <div style="text-align: center;">
        <a href="${blockLink}" style="display: inline-block; padding: 10px 20px; background-color: #E0245E; color: #fff; text-decoration: none; border-radius: 5px; margin-bottom: 20px;">Block Login</a>
      </div>
      <p>Please verify that this login was authorized. If you have any questions or concerns, please contact our customer support team.</p>
    </div>
  </div>
`;

const alumniApprovalHTML = (name, email, password) => `
<div style="max-width: 600px; margin: auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgb(104, 182, 255);">
  <div style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
    <img src="https://drive.google.com/uc?export=view&id=1Qw2w03UgG3318MBozxUjYwFg74xLaRd0" alt="Campus Connects Logo" style="display: block; margin: auto auto 20px;max-width: 50%;" />
    <h2 style="text-align:center;color:#111827;">Your Alumni Account Is Ready</h2>
    <p style="font-size: 16px; margin-bottom: 12px; text-align: left; color: #4b5563;">Dear ${name},</p>
    <p style="font-size: 16px; margin-bottom: 16px; text-align: left; color: #4b5563;">Your request to join the Alumni Network has been approved. You can now sign in using the credentials below:</p>
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px;margin:12px 0;">
      <p style="margin:0;color:#111827;"><strong>Email:</strong> ${email}</p>
      <p style="margin:0;color:#111827;"><strong>Temporary Password:</strong> ${password}</p>
    </div>
    <p style="font-size: 14px; color: #6b7280;">For security, please change your password after logging in.</p>
    <div style="text-align:center;margin-top:20px;">
      <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/signin" style="background-color: #3b82f6; color: #ffffff; padding: 12px 25px; border-radius: 6px; text-decoration: none; display: inline-block; font-size: 16px; font-weight: bold;">Sign In</a>
    </div>
  </div>
</div>`;

module.exports = { verifyEmailHTML, verifyLoginHTML, alumniApprovalHTML };
