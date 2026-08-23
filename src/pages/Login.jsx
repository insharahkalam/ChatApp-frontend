import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/login", form);
      console.log(data,"check data login");
      
      login(data);
      nav("/");
    } catch (err) { alert(err.response?.data?.msg || "Error"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-2xl w-96 space-y-4">
        <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back</h2>
        <input type="email" placeholder="Email" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-semibold">Login</button>
        <p className="text-center text-sm text-gray-600">No account? <Link to="/register" className="text-indigo-600">Register</Link></p>
      </form>
    </div>
  );
}
