import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, AtSign, UserCircle, AlertCircle, CheckCircle, Key } from "lucide-react";

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
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: Code
  const [form, setForm] = useState({
    firstName: "", lastName: "", nickname: "", email: "", username: "", password: "", confirmPassword: ""
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.nickname.trim()) errs.nickname = "Required";
    if (!form.username.trim()) errs.username = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!isValidEmail(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Required";
    else if (!isValidPassword(form.password)) errs.password = "8-16 chars, upper, lower, number, special";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  // STEP 1: Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setMessage({ type: "success", text: "Code sent to your email!" });
      setStep(2); // Move to Verification Step
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Error occurred" });
    }
    setLoading(false);
  };

  // STEP 2: Verify Code
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/auth/verify-email", { email: form.email, code: verificationCode });
      setMessage({ type: "success", text: "Getting settings ready... You may go login now!" });
      setTimeout(() => navigate("/login"), 2500); // Auto Redirect
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Invalid code" });
    }
    setLoading(false);
  };

  // Resend Code
  const handleResend = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/resend-verification", { email: form.email });
      setMessage({ type: "success", text: "A new code has been sent to your email." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Error resending code" });
    }
    setLoading(false);
  };

  const inputClass = (name) => `w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${errors[name] ? "border-red-400" : "border-gray-300"}`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-2xl">
        
        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <>
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
                  <label className={labelClass}>First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} className={inputClass("firstName")} />
                  </div>
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} className={inputClass("lastName")} />
                  </div>
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Nickname & Username Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nickname *</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" name="nickname" placeholder="johndoe" value={form.nickname} onChange={handleChange} className={inputClass("nickname")} />
                  </div>
                  {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>}
                </div>
                <div>
                  <label className={labelClass}>Username *</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" name="username" placeholder="john_doe123" value={form.username} onChange={handleChange} className={inputClass("username")} />
                  </div>
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input type="email" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} className={inputClass("email")} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} className={inputClass("password")} />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="password" name="confirmPassword" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} className={inputClass("confirmPassword")} />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg">
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: Email Verification */}
        {step === 2 && (
          <div className="text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Verify Email</h2>
            <p className="text-gray-500 mt-2 mb-8">
              We sent a 6-digit code to your<span className="font-semibold text-gray-800">ASSOCIATED EMAIL</span>
            </p>

            <form onSubmit={handleVerify} className="space-y-5">
              <div className="relative">
                <Key className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Enter 6-digit code" 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest font-semibold"
                  maxLength={6}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
                {loading ? "Verifying..." : "Verify Account"}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <button onClick={handleResend} disabled={loading} className="text-blue-600 font-semibold hover:underline mt-1 disabled:opacity-50">
                Resend Code
              </button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm flex items-center justify-center gap-2 ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Footer (Only show on step 1) */}
        {step === 1 && (
          <p className="mt-6 text-center text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}