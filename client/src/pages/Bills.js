import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Archive,
  Copy,
  RefreshCw,
  X,
  Search,
  UserPlus,
  Receipt,
  AlertCircle,
  CheckCircle,
  Users
} from "lucide-react";

export default function Bills() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showAddPerson, setShowAddPerson] = useState(null);
  const [showAddGuest, setShowAddGuest] = useState(null);
  const [billName, setBillName] = useState("");
  const [editName, setEditName] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [guestForm, setGuestForm] = useState({ firstName: "", lastName: "", email: "" });

  const fetchBills = async () => {
    try {
      const res = await api.get("/bills");
      setBills(res.data);
    } catch (err) {
      setMsg({ type: "error", text: "Failed to load bills" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  const clearMsg = () => setTimeout(() => setMsg({ type: "", text: "" }), 3000);

  // CREATE BILL
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!billName.trim()) return;
    try {
      await api.post("/bills/create", { billName });
      setBillName("");
      setShowCreate(false);
      setMsg({ type: "success", text: "Bill created!" });
      fetchBills();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error creating bill" });
    }
    clearMsg();
  };

  // EDIT BILL
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await api.put(`/bills/${showEdit._id}`, { billName: editName });
      setShowEdit(null);
      setMsg({ type: "success", text: "Bill updated!" });
      fetchBills();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error updating bill" });
    }
    clearMsg();
  };

  // DELETE BILL
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      await api.delete(`/bills/${id}`);
      setMsg({ type: "success", text: "Bill deleted" });
      fetchBills();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error deleting bill" });
    }
    clearMsg();
  };

  // ARCHIVE BILL
  const handleArchive = async (id) => {
    try {
      await api.put(`/bills/${id}/archive`);
      setMsg({ type: "success", text: "Bill archived" });
      fetchBills();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error archiving bill" });
    }
    clearMsg();
  };

  // REGENERATE CODE
  const handleRegenCode = async (id) => {
    try {
      const res = await api.put(`/bills/${id}/regenerate-code`);
      setMsg({ type: "success", text: `New code: ${res.data.inviteCode}` });
      fetchBills();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error regenerating code" });
    }
    clearMsg();
  };

  // COPY CODE
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setMsg({ type: "success", text: "Invite code copied!" });
    clearMsg();
  };

  // SEARCH USERS
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await api.get(`/auth/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data);
    } catch {}
  };

  // ADD PARTICIPANT
  const handleAddParticipant = async (billId, userId) => {
    try {
      await api.post("/bills/add-participant", { billId, userId });
      setMsg({ type: "success", text: "Person added to bill!" });
      setShowAddPerson(null);
      setSearchQuery("");
      setSearchResults([]);
      fetchBills();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error adding person" });
    }
    clearMsg();
  };

  // ADD GUEST
  const handleAddGuest = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email } = guestForm;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    try {
      const guestRes = await api.post("/auth/register-guest", guestForm);
      const guestId = guestRes.data.user.id;
      await api.post("/bills/add-participant", { billId: showAddGuest._id, userId: guestId });
      setMsg({ type: "success", text: "Guest added to bill!" });
      setShowAddGuest(null);
      setGuestForm({ firstName: "", lastName: "", email: "" });
      fetchBills();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error adding guest" });
    }
    clearMsg();
  };

  // REMOVE PARTICIPANT
  const handleRemoveParticipant = async (billId, userId) => {
    try {
      await api.post("/bills/remove-participant", { billId, userId });
      setMsg({ type: "success", text: "Person removed" });
      fetchBills();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error removing person" });
    }
    clearMsg();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Messages */}
      {msg.text && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Bills</h2>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Create Bill
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Create New Bill</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate}>
              <input type="text" placeholder="Bill name" value={billName} onChange={e => setBillName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none" autoFocus />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Create</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Edit Bill</h3>
              <button onClick={() => setShowEdit(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleEdit}>
              <input type="text" placeholder="Bill name" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none" autoFocus />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add Person to "{showAddPerson.billName}"</h3>
              <button onClick={() => { setShowAddPerson(null); setSearchQuery(""); setSearchResults([]); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search users by name, email, or username..." value={searchQuery} onChange={e => handleSearch(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" autoFocus />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map(u => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-500">{u.email} {u.accountType === "guest" && "(Guest)"}</p>
                  </div>
                  <button onClick={() => handleAddParticipant(showAddPerson._id, u._id)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700">Add</button>
                </div>
              ))}
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No users found</p>
              )}
            </div>
            {/* Add guest button */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => { setShowAddPerson(null); setShowAddGuest(showAddPerson); setSearchQuery(""); setSearchResults([]); }} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <UserPlus className="w-4 h-4" /> Add Guest User Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add Guest User</h3>
              <button onClick={() => setShowAddGuest(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddGuest} className="space-y-3">
              <input type="text" placeholder="First Name" value={guestForm.firstName} onChange={e => setGuestForm({ ...guestForm, firstName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              <input type="text" placeholder="Last Name" value={guestForm.lastName} onChange={e => setGuestForm({ ...guestForm, lastName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              <input type="email" placeholder="Email Address" value={guestForm.email} onChange={e => setGuestForm({ ...guestForm, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Add Guest</button>
            </form>
          </div>
        </div>
      )}

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="text-center py-20">
          <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No bills yet</h3>
          <p className="text-gray-400 text-sm mt-1">Create your first bill to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bills.map(bill => (
            <div key={bill._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{bill.billName}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Created by {bill.hostId?.firstName} {bill.hostId?.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => copyCode(bill.inviteCode)} title="Copy invite code" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleRegenCode(bill._id)} title="Regenerate code" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Invite code */}
              <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">Invite Code:</span>
                <span className="font-mono font-bold text-blue-600 tracking-wider">{bill.inviteCode}</span>
              </div>

              {/* Participants */}
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">{bill.participants.length} participant{bill.participants.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bill.participants.map((p, i) => (
                    <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${p.role === "host" ? "bg-blue-100 text-blue-700" : p.role === "guest" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                      {p.userId?.firstName} {p.userId?.lastName}
                      {p.role === "host" && " (Host)"}
                      {p.role === "guest" && " (Guest)"}
                      {p.role !== "host" && bill.hostId?._id === user?._id && (
                        <button onClick={() => handleRemoveParticipant(bill._id, p.userId?._id)} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      )}
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
                  <>
                    <button onClick={() => { setShowEdit(bill); setEditName(bill.billName); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => setShowAddPerson(bill)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-sm font-medium transition-colors">
                      <UserPlus className="w-4 h-4" /> Add Person
                    </button>
                    <button onClick={() => handleArchive(bill._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 text-sm font-medium transition-colors">
                      <Archive className="w-4 h-4" /> Archive
                    </button>
                    <button onClick={() => handleDelete(bill._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
