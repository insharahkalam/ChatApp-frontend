import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [online, setOnline] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const s = io("http://localhost:5000");
    s.emit("setup", user._id);
    s.on("online-users", setOnline);
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  return <SocketContext.Provider value={{ socket, online }}>{children}</SocketContext.Provider>;
};
