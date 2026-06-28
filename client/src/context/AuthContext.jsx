import { useState, useEffect } from "react";
import api from "../axios/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./auth";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await api.get("/user/profile");

      if (res.data?.success) {
        const currentUser = {
          id: res.data.user?._id,
          name: res.data.user?.name || "User",
          email: res.data.user?.email,
          role: res.data.user?.role || "user",
        };

        setUser(currentUser);
        localStorage.setItem("learnable_has_session", "true");
        return currentUser;
      }
    } catch {
      setUser(null);
      localStorage.removeItem("learnable_has_session");
      return null;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (localStorage.getItem("learnable_has_session") === "true") {
          await refreshUser();
        }
    } finally {
      setAuthLoading(false);
    }
  };

  loadUser();
}, []);

  // REGISTER API
  const signup = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role: "user"
      });

      console.log(res.data);
      setIsSignUpOpen(false)

      alert("Account created! Please check your email to verify, then log in.")
      setIsLoginOpen(true)

    } catch (error) {
      console.log(error.response?.data);
      const errData = error.response?.data;

      const errorMsg = errData?.message || (errData?.errors?.join("\n")) || "Please try again";
      alert("Signup failed:\n" + errorMsg)
    }
  };

  // LOGIN API
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const loggedInUser = {
        id: res.data.user?.id,
        name: res.data.user?.name || "User",
        email,
        role: res.data.user?.role || "user"
      }

      console.log(res.data);

      setUser(loggedInUser);
      localStorage.setItem("learnable_has_session", "true");

      setIsLoginOpen(false);

      const postLoginRedirect = sessionStorage.getItem("postLoginRedirect");
      if (postLoginRedirect) {
        sessionStorage.removeItem("postLoginRedirect");
        navigate(postLoginRedirect);
        return;
      }

      const role = loggedInUser.role;
      if (role === "admin") navigate("/admin");
      else if (role === "teacher") navigate("/teacher");
      else if (role === "student") navigate("/student");
      else navigate("/");
    } catch (error) {
      console.log(error.response?.data);
      alert('Invalid email or password: ' + error.response?.data?.message);
    }
  };

  const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.log(error.response?.data || error.message);
  } finally {
    setUser(null);
    localStorage.removeItem("learnable_has_session");
    navigate("/");
  }
};

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsSignUpOpen(false);
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
  };

  const openSignUp = () => {
    setIsSignUpOpen(true);
    setIsLoginOpen(false);
  };

  const closeSignUp = () => {
    setIsSignUpOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoginOpen,
        isSignUpOpen,
        authLoading,

        login,
        signup,
        refreshUser,

        logout,

        openLogin,
        closeLogin,

        openSignUp,
        closeSignUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
