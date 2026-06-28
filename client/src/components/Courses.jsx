import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Loader2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../axios/api";
import { useAuth } from "../context/auth";
import CourseThumbnail from "./CourseThumbnail";

export default function Courses() {
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [courses, setCourses] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    api
      .get("/v1/courses")
      .then(async (res) => {
        if (!isActive || !res.data?.success) return;

        const approvedCourses = res.data.data || [];
        setCourses(approvedCourses);

        const stats = await Promise.all(
          approvedCourses.map(async (course) => {
            try {
              const statsRes = await api.get(
                `/v1/reviews/course/${course._id}/stats`,
              );
              return [
                course._id,
                statsRes.data?.data || { averageRating: 0, totalReviews: 0 },
              ];
            } catch {
              return [course._id, { averageRating: 0, totalReviews: 0 }];
            }
          }),
        );

        if (isActive) {
          setReviewStats(Object.fromEntries(stats));
        }
      })
      .catch(() => {
        if (isActive) {
          setCourses([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const visibleCourses = courses;

  const categories = useMemo(() => {
    const names = visibleCourses
      .map((course) => course.category?.name || course.category)
      .filter(Boolean);

    return ["All", ...new Set(names)];
  }, [visibleCourses]);

  const filteredCourses =
    activeCategory === "All"
      ? visibleCourses
      : visibleCourses.filter((course) => {
          const categoryName = course.category?.name || course.category;
          return categoryName === activeCategory;
        });

  const handleCourseClick = () => {
    if (!user) {
      sessionStorage.setItem("postLoginRedirect", "/courses");
      openLogin();
      return;
    }

    navigate("/courses");
  };

  return (
    <section id="courses" className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c3c2e] tracking-tight mb-3">
              Popular Courses
            </h2>
            <p className="text-gray-500 max-w-md">
              Approved teacher courses appear here after admin review.
            </p>
          </div>

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

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-[#0c3c2e]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-10 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-black text-gray-900">
              No approved courses yet
            </h3>
            <p className="text-gray-500 mt-2">
              Once a teacher submits a course and an admin approves it, it will
              show here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.slice(0, 6).map((course) => {
              const categoryName = course.category?.name || "Approved Course";
              const stats = reviewStats[course._id] || {
                averageRating: 0,
                totalReviews: 0,
              };

              return (
                <article
                  key={course._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col text-left group"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    <CourseThumbnail
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-4 left-4 bg-emerald-950/90 backdrop-blur-md text-[#dce739] text-xs font-extrabold px-3 py-1.5 rounded-lg border border-white/10 shadow-md">
                      {categoryName}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-[#dce739] text-[#0c3c2e] text-sm font-black px-3 py-1.5 rounded-lg shadow-md">
                      ${course.price || 0}
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-3 text-xs font-bold">
                        <span className="text-[#0c3c2e] uppercase tracking-wider truncate">
                          {course.teacher?.name
                            ? `By ${course.teacher.name}`
                            : categoryName}
                        </span>
                        <span className="text-amber-500 flex items-center space-x-1 flex-shrink-0">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-gray-700">
                            {stats.averageRating || 0}
                          </span>
                          <span className="text-gray-400 font-medium">
                            ({stats.totalReviews || 0})
                          </span>
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-gray-900 group-hover:text-[#0c3c2e] transition-colors leading-snug line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-gray-500">
                        {course.lessons?.length || 0} lessons
                      </div>
                      <button
                        onClick={handleCourseClick}
                        className="inline-flex items-center gap-2 text-sm font-black text-[#0c3c2e] hover:text-[#0c3c2e]/80"
                      >
                        Enroll <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {visibleCourses.length > 0 && (
          <div className="mt-10 text-center">
            <button
              onClick={handleCourseClick}
              className="inline-flex items-center gap-2 bg-[#0c3c2e] text-white px-6 py-3 rounded-xl font-black hover:bg-[#0c3c2e]/90 transition-colors"
            >
              Browse All Courses <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
