import { createContext, useContext, useState } from "react";
import api from "../axios/api"

const AuthContext = createContext(undefined);




export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);



  // REGISTER API
  const signup = async (name, email, password) => {

    try {

      const res = await api.post("/register", {
        name,
        email,
        password
      });


      console.log(res.data);


      setUser({
        name,
        email
      });


      setIsSignUpOpen(false);


    } catch (error) {

      console.log(error.response?.data);
      alert("Signup failed");

    }
  };




  // LOGIN API
  const login = async (email, password) => {

    try {

      const res = await api.post("/login", {
        email,
        password
      });


      console.log(res.data);


      setUser({
        name: res.data.user?.name || "User",
        email
      });


      setIsLoginOpen(false);


    } catch (error) {

      console.log(error.response?.data);
      alert("Invalid email or password");

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
        closeSignUp
      }}

    >

      {children}

    </AuthContext.Provider>

  );

}



export function useAuth(){

  const context = useContext(AuthContext);

  if(!context){
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;

}