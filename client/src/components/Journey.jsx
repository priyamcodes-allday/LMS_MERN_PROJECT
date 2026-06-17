export default function Journey() {
  const steps = [
    {
      number: "01",
      title: "Choose Your Course",
      desc: "Explore our catalog and find the course that aligns with your professional or academic goals.",
    },
    {
      number: "02",
      title: "Sign Up and Pay",
      desc: "Quick registration and secure checkout process to gain instant lifetime access to materials.",
    },
    {
      number: "03",
      title: "Learn and Engage",
      desc: "Study at your own pace, complete assignments, and interact with top-class university mentors.",
    },
  ];

  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3c2e] tracking-tight mb-4">
          Your Online Learning Journey Made Easy
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg mb-16 leading-relaxed">
          We have streamlined the entire process. Just follow these three simple
          steps to start advancing your career.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left relative group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0c3c2e] text-[#dce739] font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-emerald-950/10 group-hover:scale-110 transition-transform duration-300">
                {step.number}
              </div>

              <h3 className="text-xl font-bold text-[#0c3c2e] mb-3">
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {step.desc}
              </p>

              {idx < 2 && (
                <div className="hidden md:block absolute top-14 left-[85%] w-[45%] border-t-2 border-dashed border-gray-200 z-0 pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
