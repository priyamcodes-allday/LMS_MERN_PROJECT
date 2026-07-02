import { useState } from "react";
import { useAuth } from "../context/auth";

export function LoginModal() {
  const { isLoginOpen, closeLogin, login, verifyOtp, openSignUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials");
  const [loading, setLoading] = useState(false);

  if (!isLoginOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const res =  await login(email, password);
    setLoading(false);
    if(res?.success){
      setStep("otp");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
     const res = await verifyOtp(email, otp);
    setLoading(false);
    if (res?.success) {
      // Reset state after successful login
      setEmail("");
      setPassword("");
      setOtp("");
      setStep("credentials");
    }
  }

   const handleClose = () => {
    setEmail("");
    setPassword("");
    setOtp("");
    setStep("credentials");
    closeLogin();
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/login/resend-otp",{
        email: formData.email,
      })
      alert(res.data.message || "OTP resent successfully to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <>
       <div className="fixed inset-0 bg-[#0c3c2e]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300">
        <div className="absolute inset-0" onClick={handleClose}></div>
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
          {step === "credentials" ? (
            <>
              <h2 className="text-2xl font-bold text-[#0c3c2e] mb-2">Welcome Back</h2>
              <p className="text-gray-500 text-sm mb-6">Log in to access your dashboard.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c3c2e] outline-none"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <a href="/forgot-password" onClick={closeLogin} className="text-xs font-semibold text-[#0c3c2e] hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c3c2e] outline-none"
                  />

                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0c3c2e] text-white font-semibold rounded-lg hover:bg-[#0c3c2e]/90 transition-colors cursor-pointer disabled:opacity-70"
                >
                  {loading ? "Checking..." : "Log In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[#0c3c2e] mb-2">Verify OTP</h2>
              <p className="text-gray-500 text-sm mb-6">
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
              </p>
              
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">One Time Password</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c3c2e] text-center tracking-widest text-lg font-bold outline-none"
                  />
                </div>
                               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0c3c2e] text-white py-2.5 rounded-lg font-bold hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="font-bold text-[#0c3c2e] hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              </form>

            </>
          )}
          {step === "credentials" && (
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{" "}
              <button
                onClick={openSignUp}
                className="text-[#0c3c2e] font-semibold hover:underline cursor-pointer"
              >
                Sign up for free
              </button>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export function SignUpModal() {
  const { isSignUpOpen, closeSignUp, signup, openLogin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isSignUpOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && password) {
      signup(name, email, password);
      setName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#0c3c2e]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300">
        {/* Click outside to close */}
        <div className="absolute inset-0" onClick={closeSignUp}></div>
        {/* Modal Content */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-gray-900">
          {/* Close Button */}
          <button
            onClick={closeSignUp}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-[#0c3c2e] mb-2">
            Create Account
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Join Learnable to start your education journey today.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c3c2e] focus:border-[#0c3c2e] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c3c2e] focus:border-[#0c3c2e] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength="8"
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}"
                title="Password must be at least 8 characters and include uppercase, lowercase, number, and special character." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c3c2e] focus:border-[#0c3c2e] outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#0c3c2e] text-white font-semibold rounded-lg hover:bg-[#0c3c2e]/90 transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <button
              onClick={openLogin}
              className="text-[#0c3c2e] font-semibold hover:underline cursor-pointer"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
