import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function LoginModal() {
  const { isLoginOpen, closeLogin, login, openSignUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isLoginOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#0c3c2e]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300">
        {/* Click outside to close */}
        <div className="absolute inset-0" onClick={closeLogin}></div>
        {/* Modal Content */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Close Button */}
          <button
            onClick={closeLogin}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-[#0c3c2e] mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Log in to access your dashboard and courses.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              Log In
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <button
              onClick={openSignUp}
              className="text-[#0c3c2e] font-semibold hover:underline cursor-pointer"
            >
              Sign up for free
            </button>
          </p>
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
