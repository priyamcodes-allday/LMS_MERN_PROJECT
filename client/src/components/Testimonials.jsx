import { Quote, Star } from "lucide-react";
import reviewer from "../assets/faculty/teacher5.jpg";

export default function Testimonials() {
  return (
    <>
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold text-[#0c3c2e] tracking-widest uppercase bg-[#0c3c2e]/10 px-3 py-1.5 rounded-lg inline-block mb-3">
              ACHIEVEMENTS
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3c2e] tracking-tight leading-tight">
              Trusted by genius people.
            </h2>
          </div>

          <div className="space-y-8 pt-4">
            <div className="border-l-4 border-[#dce739] pl-6">
              <p className="text-4xl lg:text-5xl font-black text-[#0c3c2e]">
                95%
              </p>
              <p className="text-gray-500 text-sm font-semibold mt-1">
                Course completion rate across all programs
              </p>
            </div>
            <div className="border-l-4 border-[#dce739] pl-6">
              <p className="text-4xl lg:text-5xl font-black text-[#0c3c2e]">
                1M+
              </p>
              <p className="text-gray-500 text-sm font-semibold mt-1">
                Active learners enrolled worldwide
              </p>
            </div>
            <div className="border-l-4 border-[#dce739] pl-6">
              <p className="text-4xl lg:text-5xl font-black text-[#0c3c2e]">
                10K
              </p>
              <p className="text-gray-500 text-sm font-semibold mt-1">
                Expert-led courses available on the platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — Testimonial Card */}
        <div className="relative">
          
          
          {/* Decorative background blob */}
          <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#dce739]/20 rounded-full blur-3xl z-0"></div>
          <div className="relative bg-gray-50 rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-lg z-10">
            
            
            {/* Quote Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#0c3c2e] text-[#dce739] flex items-center justify-center mb-6 shadow-md">
              <Quote className="w-6 h-6" />
            </div>
            
            
            
            {/* Star Rating */}
            <div className="flex space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            
            
            
            {/* Testimonial Text */}
            <p className="text-gray-700 text-lg leading-relaxed italic mb-8">
              "This platform completely transformed my career. The courses are
              detailed, the mentors are world-class, and the flexibility to
              learn at my own pace made all the difference. I went from a
              beginner to landing my dream job in just 6 months."
            </p>
            
            
            
            {/* Reviewer Info */}
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <img
                src={reviewer}
                alt="Reviewer"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#0c3c2e]/20 shadow-sm"
              />
              <div>
                <p className="font-bold text-[#0c3c2e] text-base">
                  Samantha Williams
                </p>
                <p className="text-gray-400 text-sm font-medium">
                  Software Engineer, Google
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
