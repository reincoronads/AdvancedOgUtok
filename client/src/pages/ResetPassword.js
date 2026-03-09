import { useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams(); // Gets the token from the URL
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", { ...form, token });
      setMessage({ type: "success", text: res.data.message });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Invalid or expired token." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Set New Password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input type="password" name="password" onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input type="password" name="confirmPassword" onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message.text && (
          <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}