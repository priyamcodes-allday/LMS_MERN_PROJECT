import { useState } from "react";

import imgInteractive from "../assets/interactive.jpg";
import imgFaculty from "../assets/faculty.jpg";
import imgLibrary from "../assets/library.jpg";
import imgWallpaper from "../assets/wallpaper.avif";

export default function Courses() {
  const categories = ["All", "Development", "Business", "Design", "Marketing"];
  const [activeCategory, setActiveCategory] = useState("All");

  const coursesData = [
    {
      id: 1,
      category: "Development",
      title: "Introduction to Web Development & HTML/CSS",
      price: "$80",
      stars: 4.8,
      reviews: 34,
      duration: "12 Hours",
      lessons: "24 Lessons",
      img: imgInteractive,
      badge: "Popular",
    },
    {
      id: 2,
      category: "Business",
      title: "Fundamentals of Financial Management & Consulting",
      price: "$95",
      stars: 4.9,
      reviews: 18,
      duration: "16 Hours",
      lessons: "32 Lessons",
      img: imgFaculty,
      badge: "Best Seller",
    },
    {
      id: 3,
      category: "Design",
      title: "Mastering UI/UX Design Principles & Wireframing",
      price: "$110",
      stars: 4.7,
      reviews: 42,
      duration: "10 Hours",
      lessons: "18 Lessons",
      img: imgLibrary,
      badge: "New",
    },
    {
      id: 4,
      category: "Marketing",
      title: "Modern Brand Strategy & Digital Marketing Campaigns",
      price: "$75",
      stars: 4.6,
      reviews: 29,
      duration: "8 Hours",
      lessons: "14 Lessons",
      img: imgWallpaper,
      badge: "Popular",
    },
    {
      id: 5,
      category: "Development",
      title: "Advanced Javascript Development & React Frameworks",
      price: "$120",
      stars: 4.9,
      reviews: 56,
      duration: "20 Hours",
      lessons: "40 Lessons",
      img: imgInteractive,
      badge: "Top Rated",
    },
    {
      id: 6,
      category: "Business",
      title: "Effective Leadership, Teamwork & Corporate Speaking",
      price: "$65",
      stars: 4.8,
      reviews: 15,
      duration: "6 Hours",
      lessons: "12 Lessons",
      img: imgFaculty,
      badge: "Hot",
    },
  ];

  const filteredCourses =
    activeCategory === "All"
      ? coursesData
      : coursesData.filter((course) => course.category === activeCategory);

  return (
    <>
      <section id="courses" className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Title & Filter Tabs Grid */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
            <div className="text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3c2e] tracking-tight mb-3">
                Popular Courses
              </h2>
              <p className="text-gray-500 max-w-md">
                Choose from top-rated, university-level online classes with new
                additions published every week.
              </p>
            </div>
            {/* Filter Categories Row */}
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 cursor-pointer ${
                    activeCategory === cat
                      ? "bg-[#0c3c2e] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* Courses Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col text-left cursor-pointer group"
              >
                {/* Course Thumbnail Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={course.img}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Micro Category Badge Overlay */}
                  <div className="absolute top-4 left-4 bg-emerald-950/90 backdrop-blur-md text-[#dce739] text-xs font-extrabold px-3 py-1.5 rounded-lg border border-white/10 shadow-md">
                    {course.badge}
                  </div>
                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-4 right-4 bg-[#dce739] text-[#0c3c2e] text-sm font-black px-3 py-1.5 rounded-lg shadow-md">
                    {course.price}
                  </div>
                </div>
                {/* Course Details Body */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Category and Rating */}
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#0c3c2e] uppercase tracking-wider">
                        {course.category}
                      </span>
                      <span className="text-amber-500 flex items-center space-x-1">
                        <span>★</span>
                        <span className="text-gray-700">{course.stars}</span>
                        <span className="text-gray-400 font-medium">
                          ({course.reviews} reviews)
                        </span>
                      </span>
                    </div>
                    {/* Title */}
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-[#0c3c2e] transition-colors leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                  {/* Info Footer Row */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>⏱</span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📖</span>
                      <span>{course.lessons}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
