import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may be invalid or expired.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md text-center">
        
        <div className="flex justify-center mb-6">
          {status === "loading" && <Loader className="w-16 h-16 text-blue-500 animate-spin" />}
          {status === "success" && <CheckCircle className="w-16 h-16 text-green-500" />}
          {status === "error" && <AlertCircle className="w-16 h-16 text-red-500" />}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verification</h2>
        <p className="text-gray-600 mb-8">{message}</p>

        {status !== "loading" && (
          <Link to="/login" className="inline-block w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all">
            Proceed to Login
          </Link>
        )}
      </div>
    </div>
  );
}