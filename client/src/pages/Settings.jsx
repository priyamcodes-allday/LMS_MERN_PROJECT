import { useState, useEffect } from "react";
import { User, Lock, CheckCircle, AlertCircle, Save } from "lucide-react";
import api from "../axios/api";
import { useAuth } from "../context/auth";
export default function Settings() {
  const { user, refreshUser } = useAuth();

  // Profile State
  const [name, setName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Teacher Application State
  const [teacherFormData, setTeacherFormData] = useState({
    qualification: "",
    specialization: "",
    experience: "",
    bio: "",
    linkedIn: "",
  });
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherMsg, setTeacherMsg] = useState({ type: "", text: "" });

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: "", text: "" });
    try {
      await api.put("/user/updateprofile", { name });
      await refreshUser(); // Update the user in AuthContext
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setProfileMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg({ type: "", text: "" });
    try {
      await api.put("/user/change-password", { currentPassword, newPassword });
      setPasswordMsg({
        type: "success",
        text: "Password changed successfully!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleApplyTeacher = async (e) => {
    e.preventDefault();
    setTeacherLoading(true);
    setTeacherMsg({ type: "", text: "" });
    try {
      const res = await api.post("/user/apply-teacher", {
        ...teacherFormData,
        experience: Number(teacherFormData.experience),
      });
      setTeacherMsg({
        type: "success",
        text: res.data.message || "Application submitted!",
      });
      setTeacherFormData({
        qualification: "",
        specialization: "",
        experience: "",
        bio: "",
        linkedIn: "",
      });
    } catch (err) {
      setTeacherMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to submit application.",
      });
    } finally {
      setTeacherLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Account Settings
          </h1>
          <p className="text-gray-500 mt-2">
            Manage your profile and security preferences.
          </p>
        </div>
        {/* Profile Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c3c2e]/10 text-[#0c3c2e] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Profile Information
              </h2>
              <p className="text-sm text-gray-500">Update your account name.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
            {profileMsg.text && (
              <div
                className={`p-4 rounded-xl flex items-center gap-2 font-semibold ${profileMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {profileMsg.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed.
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileLoading || name === user?.name}
                className="flex items-center gap-2 bg-[#0c3c2e] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-50"
              >
                {profileLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        {/* Password Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c3c2e]/10 text-[#0c3c2e] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            {passwordMsg.text && (
              <div
                className={`p-4 rounded-xl flex items-center gap-2 font-semibold ${passwordMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
              >
                {passwordMsg.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {passwordMsg.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="8"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordLoading || !currentPassword || !newPassword}
                className="flex items-center gap-2 bg-[#0c3c2e] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-50"
              >
                {passwordLoading ? (
                  "Updating..."
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Teacher Application Section (Only for Students) */}
        {user?.role === "student" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Become an Instructor
                </h2>
                <p className="text-sm text-gray-500">
                  Apply to teach courses on the platform.
                </p>
              </div>
            </div>

            <form onSubmit={handleApplyTeacher} className="p-6 space-y-4">
              {teacherMsg.text && (
                <div
                  className={`p-4 rounded-xl flex items-center gap-2 font-semibold ${teacherMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
                >
                  {teacherMsg.type === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {teacherMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master's in Computer Science"
                    value={teacherFormData.qualification}
                    onChange={(e) =>
                      setTeacherFormData({
                        ...teacherFormData,
                        qualification: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Web Development"
                    value={teacherFormData.specialization}
                    onChange={(e) =>
                      setTeacherFormData({
                        ...teacherFormData,
                        specialization: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={teacherFormData.experience}
                    onChange={(e) =>
                      setTeacherFormData({
                        ...teacherFormData,
                        experience: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={teacherFormData.linkedIn}
                    onChange={(e) =>
                      setTeacherFormData({
                        ...teacherFormData,
                        linkedIn: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Short Bio
                </label>
                <textarea
                  rows="3"
                  placeholder="Tell students a little about yourself..."
                  value={teacherFormData.bio}
                  onChange={(e) =>
                    setTeacherFormData({
                      ...teacherFormData,
                      bio: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={teacherLoading}
                  className="flex items-center gap-2 bg-[#0c3c2e] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-50"
                >
                  {teacherLoading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
