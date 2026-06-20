import { useAuth } from '../context/AuthContext';

export default function AdmissionBanner() {
  const { user, openSignUp } = useAuth();

  return (
    <section className="bg-[#0c3c2e] py-16 px-6 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-10 w-48 h-48 bg-emerald-800 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-10 w-64 h-64 bg-[#dce739]/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Admission is open for<br />the next year batch.
        </h2>
        <p className="text-emerald-200 text-base sm:text-lg max-w-xl mx-auto">
          Don't miss this opportunity. Reserve your spot today and begin your learning journey with top university mentors.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <a
              href="#courses"
              className="px-8 py-4 bg-[#dce739] text-[#0c3c2e] font-extrabold rounded-lg shadow-lg hover:bg-[#dce739]/90 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              Explore Courses
            </a>
          ) : (
            <button
              onClick={openSignUp}
              className="px-8 py-4 bg-[#dce739] text-[#0c3c2e] font-extrabold rounded-lg shadow-lg hover:bg-[#dce739]/90 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              Apply Now
            </button>
          )}
          <a
            href="#courses"
            className="px-8 py-4 border-2 border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            View Courses
          </a>
        </div>
      </div>
    </section>
  );
}
