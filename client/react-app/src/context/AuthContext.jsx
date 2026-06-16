import { createContext, useContext, useState } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const login = (email, password) => {
    setUser({
      name: "Jane Doe",
      email: email,
    });
    setIsLoginOpen(false);
  };

  const signup = (name, email, password) => {
    setUser({
      name: name,
      email: email,
    });
    setIsSignUpOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsSignUpOpen(false);
  };

  const closeLogin = () => setIsLoginOpen(false);

  const openSignUp = () => {
    setIsSignUpOpen(true);
    setIsLoginOpen(false);
  };

  const closeSignUp = () => setIsSignUpOpen(false);

  const value = {
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
  };

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be used within a Authprovider')
    }
    return context;
}