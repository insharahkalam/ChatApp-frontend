import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/register", form);
      login(data);
      nav("/");
    } catch (err) { alert(err.response?.data?.msg || "Error"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-2xl w-96 space-y-4">
        <h2 className="text-3xl font-bold text-center text-gray-800">Create Account</h2>
        <input placeholder="Name" className="w-full border p-3 rounded-lg" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" placeholder="Email" className="w-full border p-3 rounded-lg" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" className="w-full border p-3 rounded-lg" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">Register</button>
        <p className="text-center text-sm text-gray-600">Have an account? <Link to="/login" className="text-purple-600">Login</Link></p>
      </form>
    </div>
  );
}
