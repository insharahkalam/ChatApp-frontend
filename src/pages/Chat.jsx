import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
      <ChatBox selectedChat={selectedChat} />
    </div>
  );
}
