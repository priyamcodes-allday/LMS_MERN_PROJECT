import { createContext, useContext, useState } from "react";
import api from "../axios/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

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

      setIsLoginOpen(false);

      const role = loggedInUser.role;
      if(role === "admin") navigate("/admin");
      else if (role === 'teacher') navigate("/teacher");
      else navigate("/student");
    } catch (error) {
      console.log(error.response?.data);
      alert('Invalid email or password: ' + error.response?.data?.message);
    }
  };

  const logout = () => {
    setUser(null);
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

        login,
        signup,

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

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
