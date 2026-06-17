import t1 from "../assets/faculty/teacher1.jpg";
import t2 from "../assets/faculty/teacher2.jpg";
import t3 from "../assets/faculty/teacher3.jpg";
import t4 from "../assets/faculty/teacher4.jpg";
import { GraduationCap, Calendar, Award, Mic, Video, MessageSquare } from 'lucide-react';


export default function Experience() {
  const teachers = [
    { name: "Dr. Sarah Smith", subject: "Computer Sci.", img: t1, status: "Active" },
    { name: "Prof. David Miller", subject: "Finance", img: t2, status: "Live" },
    { name: "Emma Watson", subject: "UI/UX Design", img: t3, status: "Active" },
    { name: "James Carter", subject: "Marketing", img: t4, status: "Session" },
  ];

  return (
    <>
       <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* 1. Left Column (Mock Video Classroom Widget) */}
        <div className="lg:col-span-6 relative animate-in fade-in duration-500">
          {/* Main classroom card frame */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 relative z-10">
            
            {/* Header bar of mock app */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 text-xs font-bold text-gray-400">
              <span>LEARNABLE CLASSROOM</span>
              <span className="text-red-500 animate-pulse">● LIVE STREAM</span>
            </div>
            {/* Grid of Tutors */}
            <div className="grid grid-cols-2 gap-4">
              {teachers.map((teacher, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 group shadow-xs">
                  <img 
                    src={teacher.img} 
                    alt={teacher.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2 bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    {teacher.status}
                  </div>
                  {/* Name Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-[#0c3c2e] shadow-sm flex justify-between">
                    <span>{teacher.name.split(' ')[1]}</span>
                    <span className="text-gray-400 font-medium">{teacher.subject}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Simulated overlay control panel */}
            <div className="flex justify-center space-x-3 mt-6 pt-4 border-t border-gray-100">
              <button className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
                <Mic className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#0c3c2e] text-white flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
                <Video className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Background decorative dots */}
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#dce739]/30 rounded-full blur-2xl z-0"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-800/10 rounded-full blur-2xl z-0"></div>
        </div>
        {/* 2. Right Column (Premium features list) */}
        <div className="lg:col-span-6 text-left space-y-8">
          <div>
            <span className="text-xs font-bold text-[#0c3c2e] tracking-widest uppercase bg-[#0c3c2e]/10 px-3 py-1.5 rounded-lg inline-block mb-3">
              PREMIUM EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3c2e] tracking-tight leading-tight">
              Offering premier online learning opportunities.
            </h2>
          </div>
          <p className="text-gray-500 leading-relaxed">
            We provide a world-class online classroom environment built on modern pedagogies. Access highly detailed material, get tested, and get certified.
          </p>
          {/* Features bullet list */}
          <div className="space-y-6">
            
            {/* Feature 1 */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#0c3c2e] flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-md font-bold text-gray-900">Learn from Top Experts</h4>
                <p className="text-gray-500 text-sm mt-1">Gain knowledge directly from certified university professors and industry consultants.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#0c3c2e] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-md font-bold text-gray-900">Flexible learning schedule</h4>
                <p className="text-gray-500 text-sm mt-1">Complete assignments and stream high-quality courses at your own pace, anytime.</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#0c3c2e] flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-md font-bold text-gray-900">Earn university credits & certificate</h4>
                <p className="text-gray-500 text-sm mt-1">Acquire recognized degree-level certifications that stand out on your resume.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
