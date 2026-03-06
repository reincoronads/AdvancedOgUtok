import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Mail, Key, Lock, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=reset
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setResetToken(res.data.resetToken);
      setMsg({ type: "success", text: "Reset token generated! Use it below to reset your password." });
      setStep(2);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error occurred" });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        token: resetToken,
        password,
        confirmPassword
      });
      setMsg({ type: "success", text: "Password reset successful! You can now login." });
      setStep(3);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error occurred" });
    }
    setLoading(false);
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400";
  const iconClass = "absolute left-4 top-4 w-5 h-5 text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            {step === 1 ? "Forgot Password" : step === 2 ? "Reset Password" : "All Done!"}
          </h2>
          <p className="text-gray-500 mt-2">
            {step === 1 && "Enter your email to reset your password"}
            {step === 2 && "Enter your new password"}
            {step === 3 && "Your password has been reset"}
          </p>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} autoFocus />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Step 2: New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">New Password</label>
              <div className="relative">
                <Lock className={iconClass} />
                <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">8-16 chars, upper + lower + number + special char</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className={iconClass} />
                <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center">
            <Link to="/login" className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg">
              Go to Login
            </Link>
          </div>
        )}

        {/* Message */}
        {msg.text && (
          <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {msg.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{msg.text}</span>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
