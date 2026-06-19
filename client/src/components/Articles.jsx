import { ArrowRight, Clock } from "lucide-react";
import img1 from "../assets/faculty/teacher6.jpg";
import img2 from "../assets/faculty/teacher7.avif";
import img3 from "../assets/faculty/teacher8.avif";

export default function Articles() {
  const articles = [
    {
      title: "How Online Education is Reshaping the Future of Learning",
      category: "Education",
      date: "June 10, 2026",
      readTime: "5 min read",
      img: img1,
    },
    {
      title: "10 Tips to Stay Productive While Studying from Home",
      category: "Productivity",
      date: "June 8, 2026",
      readTime: "4 min read",
      img: img2,
    },
    {
      title: "Why Employers Value Online Certifications More Than Ever",
      category: "Career",
      date: "June 5, 2026",
      readTime: "6 min read",
      img: img3,
    },
  ];

  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">

        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3c2e] tracking-tight mb-3">
              Latest Articles
            </h2>
            <p className="text-gray-500 max-w-md">
              Stay updated with the latest trends in education, technology, and
              career growth.
            </p>
          </div>
          <button className="flex items-center space-x-2 text-[#0c3c2e] font-bold text-sm hover:underline cursor-pointer group">
            <span>View All Articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>



        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
            >


              {/* Article Image */}
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={article.img}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>



              {/* Article Body */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#0c3c2e] uppercase tracking-wider bg-[#0c3c2e]/10 px-2.5 py-1 rounded-md">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0c3c2e] transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                </div>



                {/* Meta Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span>{article.date}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
