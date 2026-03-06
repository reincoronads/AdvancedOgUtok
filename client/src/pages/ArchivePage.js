import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  Archive as ArchiveIcon,
  Eye,
  RotateCcw,
  Users,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function ArchivePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchArchived = async () => {
    try {
      const res = await api.get("/bills/archived");
      setBills(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchArchived(); }, []);

  const clearMsg = () => setTimeout(() => setMsg({ type: "", text: "" }), 3000);

  const handleUnarchive = async (id) => {
    try {
      await api.put(`/bills/${id}/unarchive`);
      setMsg({ type: "success", text: "Bill restored to active" });
      fetchArchived();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error restoring bill" });
    }
    clearMsg();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-5xl mx-auto">
      {msg.text && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Archived Bills</h2>

      {bills.length === 0 ? (
        <div className="text-center py-20">
          <ArchiveIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No archived bills</h3>
          <p className="text-gray-400 text-sm mt-1">Bills you archive will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bills.map(bill => (
            <div key={bill._id} className="bg-white rounded-xl border border-gray-200 p-5 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{bill.billName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Archived</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Created by {bill.hostId?.firstName} {bill.hostId?.lastName}
                    {bill.archivedAt && ` | Archived ${new Date(bill.archivedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">{bill.participants.length} participant{bill.participants.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bill.participants.map((p, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {p.userId?.firstName} {p.userId?.lastName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => navigate(`/dashboard/bill/${bill._id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition-colors">
                  <Eye className="w-4 h-4" /> View
                </button>
                {bill.hostId?._id === user?._id && (
                  <button onClick={() => handleUnarchive(bill._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-sm font-medium transition-colors">
                    <RotateCcw className="w-4 h-4" /> Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
