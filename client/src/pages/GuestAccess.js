import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Receipt,
  Users,
  DollarSign,
  AlertCircle,
  UserPlus,
  ArrowLeft
} from "lucide-react";

export default function GuestAccess() {
  const [code, setCode] = useState("");
  const [bill, setBill] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setMsg("");
    setBill(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/bills/code/${code.trim().toUpperCase()}`);
      setBill(res.data);
    } catch (err) {
      setMsg(err.response?.data?.message || "No bill found with this code");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Guest Access</h1>
          <p className="text-gray-500">Enter your invitation code to view a bill</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter invitation code (e.g. ABC123)"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 uppercase font-mono tracking-wider"
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? "..." : "Search"}
            </button>
          </div>
        </form>

        {msg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{msg}</span>
          </div>
        )}

        {/* Bill Result */}
        {bill && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-bold">{bill.billName}</h2>
              <p className="text-blue-100 mt-1">
                Host: {bill.hostId?.firstName} {bill.hostId?.lastName}
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                Code: {bill.inviteCode}
              </span>
            </div>

            <div className="p-6">
              {/* Participants */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-700">Participants ({bill.participants?.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bill.participants?.map((p, i) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${p.role === "host" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.userId?.firstName} {p.userId?.lastName}
                      {p.role === "host" && " (Host)"}
                      {p.role === "guest" && " (Guest)"}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
                <p className="font-medium">Guest Access Limit</p>
                <p className="mt-1">As a guest, you can access bills for 6 hours per day. Create an account for unlimited access!</p>
              </div>

              {/* Upgrade CTA */}
              <div className="mt-4 text-center">
                <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
                  <UserPlus className="w-4 h-4" /> Create an Account
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
