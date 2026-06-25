import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout, openLogin, openSignUp } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <nav className="relative z-30 px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        {/* 1. Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-wider text-white">
            LEARNABLE<span className="text-[#dce739]">.</span>
          </span>
        </div>
        {/* 2. Desktop Navigation Menu */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide text-gray-200">
          <a href="#home" className="hover:text-white transition-colors">
            HOME
          </a>
          <a href="#courses" className="hover:text-white transition-colors">
            COURSES
          </a>
          <a href="#products" className="hover:text-white transition-colors">
            PRODUCTS
          </a>
          <a href="#mentors" className="hover:text-white transition-colors">
            MENTORS
          </a>
          <a href="#testimonials" className="hover:text-white transition-colors">
            TESTIMONIALS
          </a>
          <Link to="/become-instructor" className="text-[#dce739] hover:text-white transition-colors">
            TEACH WITH US
          </Link>
        </div>
        {/* 3. Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-emerald-100">
                Hi,{" "}
                <strong className="text-white">
                  {user.name.split(" ")[0]}
                </strong>
                !
              </span>
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-lg transition-colors border border-white/20 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={openLogin}
                className="px-4 py-2.5 text-white hover:text-white/80 font-bold text-sm transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={openSignUp}
                className="px-5 py-2.5 bg-[#dce739] text-[#0c3c2e] hover:bg-[#dce739]/90 font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                Join Now
              </button>
            </>
          )}
        </div>
        {/* 4. Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden text-white hover:text-gray-300 focus:outline-none cursor-pointer"
        >
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            {isMobileOpen ? (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.278 16.864a1 1 0 01-1.414 1.414l-4.829-4.83-4.828 4.83a1 1 0 01-1.414-1.414l4.829-4.83-4.83-4.828a1 1 0 011.414-1.414l4.83 4.829 4.828-4.83a1 1 0 111.414 1.414l-4.83 4.83 4.83 4.828z"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
              />
            )}
          </svg>
        </button>
        {/* 5. Mobile Navigation Menu Sheet */}
        {isMobileOpen && (
          <div className="absolute top-20 left-4 right-4 bg-[#0c3c2e] border border-white/10 rounded-xl p-6 shadow-xl z-40 md:hidden flex flex-col space-y-4 text-center">
            <a
              href="#home"
              onClick={() => setIsMobileOpen(false)}
              className="text-gray-200 hover:text-white font-semibold"
            >
              HOME
            </a>
            <a
              href="#courses"
              onClick={() => setIsMobileOpen(false)}
              className="text-gray-200 hover:text-white font-semibold"
            >
              COURSES
            </a>
            <a
              href="#products"
              onClick={() => setIsMobileOpen(false)}
              className="text-gray-200 hover:text-white font-semibold"
            >
              PRODUCTS
            </a>
            <a
              href="#mentors"
              onClick={() => setIsMobileOpen(false)}
              className="text-gray-200 hover:text-white font-semibold"
            >
              MENTORS
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileOpen(false)}
              className="text-gray-200 hover:text-white font-semibold"
            >
              FAQ
            </a>
            <Link
              to="/become-instructor"
              onClick={() => setIsMobileOpen(false)}
              className="text-[#dce739] hover:text-white font-semibold"
            >
              TEACH WITH US
            </Link>
            <hr className="border-white/10" />

            {user ? (
              <div className="flex flex-col space-y-3">
                <span className="text-gray-200">
                  Hi, <strong>{user.name}</strong>!
                </span>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileOpen(false);
                  }}
                  className="w-full py-2.5 bg-white/10 text-white font-bold rounded-lg border border-white/20 cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    openLogin();
                    setIsMobileOpen(false);
                  }}
                  className="w-full py-2.5 text-white font-bold cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    openSignUp();
                    setIsMobileOpen(false);
                  }}
                  className="w-full py-2.5 bg-[#dce739] text-[#0c3c2e] font-bold rounded-lg cursor-pointer"
                >
                  Join Now
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
