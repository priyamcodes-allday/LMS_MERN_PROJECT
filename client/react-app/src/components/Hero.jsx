import { useAuth } from "../context/AuthContext";
import heroStudent from "../assets/GX8KBbVmC6c.jpg";

export default function Hero() {
  const { openSignUp, user } = useAuth();

  return (
    <div className="bg-[#0c3c2e] text-white pt-6 pb-16 lg:pb-24 px-6 overflow-hidden relative">
      {/* Subtle background decorative shapes */}
      <div className="absolute top-1/4 left-5 w-24 h-24 bg-emerald-800 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-10 right-5 w-40 h-40 bg-emerald-700 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* 1. Left Content Column */}
        <div className="lg:col-span-7 text-left space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Leading educational platforms available online
          </h1>

          <p className="text-gray-300 text-lg max-w-xl font-medium leading-relaxed">
            Gain access to first-class tutors, interactive curriculum, and a
            community of active learners. Master new skills from anywhere in the
            world.
          </p>

          {/* Dynamic Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {user ? (
              <a
                href="#courses"
                className="px-8 py-4 bg-[#dce739] text-[#0c3c2e] font-extrabold text-center rounded-lg shadow-lg hover:bg-[#dce739]/90 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
              >
                Browse Your Courses
              </a>
            ) : (
              <button
                onClick={openSignUp}
                className="px-8 py-4 bg-[#dce739] text-[#0c3c2e] font-extrabold text-center rounded-lg shadow-lg hover:bg-[#dce739]/90 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
              >
                Get Started
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl lg:text-4xl font-extrabold text-white">
                270+
              </p>
              <p className="text-gray-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mt-1">
                Courses
              </p>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-extrabold text-white">
                5550+
              </p>
              <p className="text-gray-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mt-1">
                Active Students
              </p>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-extrabold text-white">
                330+
              </p>
              <p className="text-gray-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mt-1">
                Tutors
              </p>
            </div>
          </div>
        </div>

        {/* 2. Right Visual Column */}
        <div className="lg:col-span-5 relative flex justify-center animate-in fade-in slide-in-from-right-6 duration-700">
          {/* Outer dashed border and circular rings matching the screenshot structure */}
          <div className="absolute w-[110%] h-[110%] border border-dashed border-white/10 rounded-full -top-5 -left-5 pointer-events-none hidden sm:block animate-[spin_60s_linear_infinite]"></div>

          <div className="relative w-full max-w-[420px] aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
            {/* The main student image */}
            <img
              src={heroStudent}
              alt="Online learning student"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Glowing yellow micro-badge overlays */}
            <div className="absolute top-4 right-4 bg-emerald-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dce739] animate-pulse"></span>
              <span className="text-xs font-bold tracking-wide uppercase text-white">
                Live Classes
              </span>
            </div>

            <div className="absolute bottom-4 left-4 bg-emerald-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-lg text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Top Rated
              </p>
              <p className="text-sm font-black text-[#dce739]">
                ★ 4.9 Course Rating
              </p>
            </div>
          </div>

          {/* Floating micro education icons (Visual decoration) */}
          <div className="absolute -top-3 -left-3 bg-[#dce739] text-[#0c3c2e] p-3 rounded-2xl shadow-lg transform -rotate-12 hidden sm:block font-bold">
            🎓
          </div>
          <div className="absolute bottom-12 -right-4 bg-emerald-950 text-white p-3.5 rounded-2xl border border-white/10 shadow-lg transform rotate-12 hidden sm:block">
            💻
          </div>
        </div>
      </div>
    </div>
  );
}
