const verifyEmailTemplate = (name, verifyUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Hello ${name}, verify your email</h2>
    <p>Click the button below to verify your email address.</p>
    <a href="${verifyUrl}" style="background:#4F46E5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;" target="_blank">
      Verify Email
    </a>
    <p>This link expires in 24 hours.</p>
  </div>
`;

const resetPasswordTemplate = (name, resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Hello ${name}, reset your password</h2>
    <p>You requested a password reset. Click below to set a new password.</p>
    <a href="${resetUrl}" style="background:#DC2626;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
      Reset Password
    </a>
    <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
  </div>
`;

const courseEnrollmentTemplate = (name, courseName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Enrollment Confirmed 🎉</h2>
    <p>Hi ${name}, you are now enrolled in <strong>${courseName}</strong>.</p>
    <p>Login to your dashboard to start learning!</p>
  </div>
`;

const teacherApprovedTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Congratulations ${name}! 🎉</h2>
    <p>Your teacher account has been approved by the admin.</p>
    <p>You can now login and start creating courses.</p>
  </div>
`;

const teacherRejectedTemplate = (name, reason) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Application Update for ${name}</h2>
    <p>Unfortunately, your teacher application was not approved.</p>
    <p><strong>Reason:</strong> ${reason || "Does not meet current requirements."}</p>
    <p>You may reapply after addressing the feedback.</p>
  </div>
`;

const courseApprovedTemplate = (teacherName, courseName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Course Approved ✅</h2>
    <p>Hi ${teacherName}, your course <strong>${courseName}</strong> has been approved and is now live!</p>
  </div>
`;

const loginOtpTemplate = (name, otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Login Verification</h2>
    <p>Hi ${name},</p>
    <p>Use the following One-Time Password (OTP) to complete your login:</p>
    <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; background: #f4f4f4; padding: 16px; text-align: center; border-radius: 6px;">
      ${otp}
    </div>
    <p>This code will expire in <strong>5 minutes</strong>.</p>
    <p>If you did not attempt to login, please ignore this email or reset your password immediately.</p>
  </div>
`;

module.exports = {
  verifyEmailTemplate,
  resetPasswordTemplate,
  courseEnrollmentTemplate,
  teacherApprovedTemplate,
  teacherRejectedTemplate,
  courseApprovedTemplate,
  loginOtpTemplate,
};
