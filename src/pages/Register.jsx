// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import API from "../services/api";
// import { useAuth } from "../context/AuthContext";

// export default function Register() {
//   const [form, setForm] = useState({ name: "", email: "", password: "" });
//   const { login } = useAuth();
//   const nav = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await API.post("/auth/register", form);
//       login(data);
//       nav("/");
//     } catch (err) { alert(err.response?.data?.msg || "Error"); }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
//       <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-2xl w-96 space-y-4">
//         <h2 className="text-3xl font-bold text-center text-gray-800">Create Account</h2>
//         <input placeholder="Name" className="w-full border p-3 rounded-lg" onChange={(e) => setForm({ ...form, name: e.target.value })} />
//         <input type="email" placeholder="Email" className="w-full border p-3 rounded-lg" onChange={(e) => setForm({ ...form, email: e.target.value })} />
//         <input type="password" placeholder="Password" className="w-full border p-3 rounded-lg" onChange={(e) => setForm({ ...form, password: e.target.value })} />
//         <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">Register</button>
//         <p className="text-center text-sm text-gray-600">Have an account? <Link to="/login" className="text-purple-600">Login</Link></p>
//       </form>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      login(data);
      nav("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE5DD]">
      {/* Top green header */}
      <div className="bg-[#075E54] pt-14 pb-20 px-6 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg mb-4">
          <svg viewBox="0 0 24 24" className="w-11 h-11 fill-[#25D366]">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.55-3.7 8.22-8.25 8.22zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.9 2.42 1.02 2.58c.12.17 1.77 2.7 4.28 3.79.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z" />
          </svg>
        </div>
        <h2 className="text-white text-2xl font-semibold">Create Account</h2>
        <p className="text-[#B4E3D8] text-sm mt-1">Join WhatsApp today</p>
      </div>

      {/* Register card */}
      <div className="flex-1 flex justify-center px-4 -mt-10">
        <form
          onSubmit={submit}
          className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 space-y-5 h-fit"
        >
          <h3 className="text-lg font-medium text-gray-800 text-center">
            Sign up to get started
          </h3>

          <div>
            <label className="text-xs text-gray-500">Name</label>
            <input
              placeholder="Enter your name"
              className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#25D366] transition-colors"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#25D366] transition-colors"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#25D366] transition-colors"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#25D366] hover:bg-[#1fb958] disabled:opacity-60 text-white py-3 rounded-full font-semibold tracking-wide transition-colors"
          >
            {loading ? "Creating account..." : "REGISTER"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Have an account?{" "}
            <Link to="/login" className="text-[#075E54] font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>
      <div className="text-center text-xs text-gray-400 py-4">
        from <span className="font-semibold text-[#25D366]">Meta</span>
      </div>
    </div>
  );
}