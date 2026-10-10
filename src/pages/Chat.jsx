// import { useState } from "react";
// import Sidebar from "../components/Sidebar";
// import ChatBox from "../components/ChatBox";

// export default function Chat() {
//   const [selectedChat, setSelectedChat] = useState(null);
//   return (
//     <div className="h-screen text-white overflow-hidden bg-[#0f1316]">
//       {/* Header */}
//       <h1 className="text-white bg-gray-900 text-3xl px-2 py-2 flex items-center gap-2">
//         <i className="fa-brands fa-whatsapp text-[#20c200]"></i> WhatsApp
//       </h1>
//       <hr className="border-gray-800" />

//       {/* MAIN LAYOUT */}
//       <section className="flex h-[92vh] overflow-hidden shadow-lg flex-col sm:flex-row">
//         <Sidebar selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
//         <ChatBox selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
//       </section>
//     </div>
//   );
// }
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { MessageCircle } from "lucide-react";

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  return (
    <div className="h-screen text-white overflow-hidden bg-[#0f1316]">
      {/* Header */}
      <h1 className="text-white bg-gray-900 text-3xl px-2 py-2 flex items-center gap-2">
        <MessageCircle size={30} className="text-[#20c200]" /> WhatsApp
      </h1>
      <hr className="border-gray-800" />

      {/* MAIN LAYOUT */}
      <section className="flex h-[92vh] overflow-hidden shadow-lg flex-col sm:flex-row">
        <Sidebar selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
        <ChatBox selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
      </section>
    </div>
  );
}