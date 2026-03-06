import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { User, Mail, Lock, AtSign, UserCircle, AlertCircle, CheckCircle } from "lucide-react";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (pw) => {
  if (pw.length < 8 || pw.length > 16) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/[a-z]/.test(pw)) return false;
  if (!/[0-9]/.test(pw)) return false;
  if (!/[^A-Za-z0-9]/.test(pw)) return false;
  return true;
};

export default function Register() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", nickname: "", email: "", username: "", password: "", confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    else if (!form.firstName.trim().length) errs.firstName = "Spaces are not valid input";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    else if (!form.lastName.trim().length) errs.lastName = "Spaces are not valid input";
    if (!form.nickname.trim()) errs.nickname = "Nickname is required";
    else if (!form.nickname.trim().length) errs.nickname = "Spaces are not valid input";
    if (!form.username.trim()) errs.username = "Username is required";
    else if (!form.username.trim().length) errs.username = "Spaces are not valid input";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!isValidEmail(form.email)) errs.email = "Please enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (!isValidPassword(form.password)) errs.password = "8-16 chars, must include uppercase, lowercase, number, and special character";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      setMessage({ type: "success", text: res.data.message });
      setForm({ firstName: "", lastName: "", nickname: "", email: "", username: "", password: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Error occurred" });
    }
    setLoading(false);
  };

  const inputClass = (name) => `w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${errors[name] ? "border-red-400" : "border-gray-300"}`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join us and start splitting bills</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input type="text" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} className={inputClass("firstName")} />
              </div>
              {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.firstName}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input type="text" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} className={inputClass("lastName")} />
              </div>
              {errors.lastName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.lastName}</p>}
            </div>
          </div>

          {/* Nickname & Username Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nickname <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(unique)</span></label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input type="text" name="nickname" placeholder="johndoe" value={form.nickname} onChange={handleChange} className={inputClass("nickname")} />
              </div>
              {errors.nickname && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nickname}</p>}
            </div>
            <div>
              <label className={labelClass}>Username <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(unique)</span></label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input type="text" name="username" placeholder="john_doe123" value={form.username} onChange={handleChange} className={inputClass("username")} />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.username}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input type="email" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} className={inputClass("email")} />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
          </div>

          {/* Password Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} className={inputClass("password")} />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
              <p className="text-xs text-gray-400 mt-1">8-16 chars, upper + lower + number + special</p>
            </div>
            <div>
              <label className={labelClass}>Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input type="password" name="confirmPassword" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} className={inputClass("confirmPassword")} />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>
              {message.text}
              {message.type === "success" && (
                <Link to="/login" className="ml-1 underline font-semibold">Login here</Link>
              )}
            </span>
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}