import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Key, Lock, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Code, Step 3: New Password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
  
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // STEP 1: Send the code to the user's email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage({ type: "success", text: res.data.message });
      setStep(2);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Something went wrong" });
    }
    setLoading(false);
  };

  // STEP 2: Verify the 6-digit code
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-reset-code", { email, code: verificationCode });
      setMessage({ type: "success", text: res.data.message });
      setStep(3);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Invalid or expired code" });
    }
    setLoading(false);
  };

  // STEP 3: Create New Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", { 
        email, 
        code: verificationCode, 
        ...passwords 
      });
      setMessage({ type: "success", text: res.data.message });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to reset password" });
    }
    setLoading(false);
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400";
  const iconClass = "absolute left-4 top-4 w-5 h-5 text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Forgot Password</h2>
              <p className="text-gray-500 mt-2">Enter your email to receive a 6-digit reset code.</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className={`${iconClass} group-focus-within:text-blue-500 transition-colors`} />
                  <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg">
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: ENTER CODE */}
        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Verify Code</h2>
              <p className="text-gray-500 mt-2">We sent a 6-digit code to your<br/><span className="font-semibold text-gray-800">ASSOCIATED EMAIL</span></p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <div>
                <div className="relative group">
                  <Key className={`${iconClass} group-focus-within:text-blue-500 transition-colors`} />
                  <input type="text" placeholder="Enter 6-digit code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} maxLength={6} required className={`${inputClass} text-center tracking-[0.5em] text-lg font-semibold`} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg">
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={handleEmailSubmit} disabled={loading} className="text-blue-600 text-sm font-semibold hover:underline">
                Resend Code
              </button>
            </div>
          </>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Set New Password</h2>
              <p className="text-gray-500 mt-2">Enter your new secure password below.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">New Password</label>
                <div className="relative group">
                  <Lock className={`${iconClass} group-focus-within:text-blue-500 transition-colors`} />
                  <input type="password" placeholder="Enter new password" value={passwords.password} onChange={(e) => setPasswords({...passwords, password: e.target.value})} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className={`${iconClass} group-focus-within:text-blue-500 transition-colors`} />
                  <input type="password" placeholder="Confirm new password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} required className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg">
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}

        {/* MESSAGES */}
        {message.text && (
          <div className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* FOOTER */}
        <p className="mt-8 text-center text-gray-600">
          Remember your password? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
        </p>

      </div>
    </div>
  );
}