import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";
import api from "../axios/api";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: ""
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/v1/categories");
        if (res.data?.success) {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const res = await api.post("/teacher/courses", {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category
      });
      
      if (res.data?.success) {
        // Course created
        navigate("/teacher");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-gray-500 mt-2">
          Start by providing the basic details. You can add video lessons and a thumbnail later!
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] focus:border-transparent transition-all bg-gray-50/50"
              placeholder="e.g. Master React in 30 Days"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Course Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] focus:border-transparent transition-all bg-gray-50/50 resize-none"
              placeholder="What will students learn in this course?"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] focus:border-transparent transition-all bg-gray-50/50"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] focus:border-transparent transition-all bg-gray-50/50"
                placeholder="0.00 (Free) or greater"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-[#0c3c2e] hover:bg-[#0c3c2e]/90 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70 shadow-sm"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Create Draft <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
