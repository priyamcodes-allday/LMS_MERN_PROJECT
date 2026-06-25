import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, ArrowRight, BookOpen } from "lucide-react";
import api from "../axios/api";

export default function TeacherSignup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    qualification: "",
    specialization: "",
    experience: "",
    bio: "",
    linkedIn: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // teacher role approval
      const res = await api.post("/auth/register", {
        ...formData,
        role: "teacher",
        experience: Number(formData.experience),
      });

      if (res.data?.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-[#0c3c2e]" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Application Received!</h2>
          <p className="mt-4 text-gray-500">
            Thank you for applying to teach. Please check your email to verify your account. 
            An admin will review your application shortly.
          </p>
          <Link to="/" className="mt-8 inline-block text-[#0c3c2e] font-bold hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Become an Instructor
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our platform and start teaching students worldwide.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Basic Info */}
              <div className="sm:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Account Details</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                />
              </div>

              {/* Professional Info */}
              <div className="sm:col-span-2 mt-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Professional Profile</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Highest Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  required
                  placeholder="e.g. Master's in Computer Science"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  required
                  placeholder="e.g. Web Development"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  required
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label>
                <input
                  type="url"
                  name="linkedIn"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedIn}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Short Bio</label>
                <textarea
                  name="bio"
                  rows="3"
                  maxLength="500"
                  placeholder="Tell students a little about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] resize-none"
                ></textarea>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 bg-[#0c3c2e] hover:bg-[#0c3c2e]/90 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70 shadow-sm"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Submit Application <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
