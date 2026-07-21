import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);
  const login = (data) => { localStorage.setItem("user", JSON.stringify(data)); setUser(data); };
  const logout = () => { localStorage.removeItem("user"); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
