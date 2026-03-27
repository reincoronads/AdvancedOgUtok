import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Receipt,
  Users,
  X,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Pencil,
  UserPlus,
  Archive,
  Copy
} from "lucide-react";

export default function BillView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditBill, setShowEditBill] = useState(false);
  const [editBillName, setEditBillName] = useState("");
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", onConfirm: null });

  const showConfirm = (title, message, onConfirm) => setConfirmModal({ open: true, title, message, onConfirm });

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    expenseName: "",
    amount: "",
    paidBy: "",
    splitType: "equal",
    splitBetween: []
  });

  const fetchBill = async () => {
    try {
      const res = await api.get(`/bills/${id}`);
      setBill(res.data);
    } catch {
      navigate("/dashboard");
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses/bill/${id}`);
      setExpenses(res.data);
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchBill(), fetchExpenses()]).finally(() => setLoading(false));
  }, [id]);

  const clearMsg = () => setTimeout(() => setMsg({ type: "", text: "" }), 3000);

  const isHost = bill?.hostId?._id === user?._id;
  const isArchived = bill?.status === "archived";

  // Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.expenseName || !expenseForm.amount) return;

    const payload = {
      billId: id,
      expenseName: expenseForm.expenseName,
      amount: parseFloat(expenseForm.amount),
      paidBy: expenseForm.paidBy || user._id,
      splitType: expenseForm.splitType,
    };

    if (expenseForm.splitType === "custom" && expenseForm.splitBetween.length > 0) {
      payload.splitBetween = expenseForm.splitBetween.map(uid => ({ userId: uid }));
    }

    try {
      await api.post("/expenses/add", payload);
      setMsg({ type: "success", text: "Expense added!" });
      setShowAddExpense(false);
      setExpenseForm({ expenseName: "", amount: "", paidBy: "", splitType: "equal", splitBetween: [] });
      fetchExpenses();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error adding expense" });
    }
    clearMsg();
  };

  // Delete Expense
  const handleDeleteExpense = (expenseId) => {
    showConfirm("Delete Expense", "This expense will be permanently removed from the bill.", async () => {
      try {
        await api.delete(`/expenses/${expenseId}`);
        setMsg({ type: "success", text: "Expense deleted" });
        fetchExpenses();
      } catch (err) {
        setMsg({ type: "error", text: err.response?.data?.message || "Error deleting expense" });
      }
      clearMsg();
    });
  };

  // EDIT BILL
  const handleEditBill = async (e) => {
    e.preventDefault();
    if (!editBillName.trim()) return;
    try {
      await api.put(`/bills/${id}`, { billName: editBillName });
      setMsg({ type: "success", text: "Bill updated!" });
      setShowEditBill(false);
      fetchBill();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error updating bill" });
    }
    clearMsg();
  };

  // ARCHIVE BILL
  const handleArchiveBill = () => {
    showConfirm("Archive Bill", "The bill will become read-only. No further changes can be made.", async () => {
      try {
        await api.put(`/bills/${id}/archive`);
        setMsg({ type: "success", text: "Bill archived" });
        navigate("/dashboard");
      } catch (err) {
        setMsg({ type: "error", text: err.response?.data?.message || "Error archiving bill" });
      }
      clearMsg();
    });
  };

  // DELETE BILL
  const handleDeleteBill = () => {
    showConfirm("Delete Bill", "This bill and all its expenses will be permanently deleted. This cannot be undone.", async () => {
      try {
        await api.delete(`/bills/${id}`);
        setMsg({ type: "success", text: "Bill deleted" });
        navigate("/dashboard");
      } catch (err) {
        setMsg({ type: "error", text: err.response?.data?.message || "Error deleting bill" });
      }
      clearMsg();
    });
  };

  // LOAD INITIAL USERS (when modal opens)
  const loadInitialUsers = async () => {
    try {
      const res = await api.get("/auth/search");
      setSearchResults(res.data);
    } catch {}
  };

  // SEARCH USERS
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { loadInitialUsers(); return; }
    try {
      const res = await api.get(`/auth/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data);
    } catch {}
  };

  // ADD PARTICIPANT
  const handleAddParticipant = async (userId) => {
    try {
      await api.post("/bills/add-participant", { billId: id, userId });
      setMsg({ type: "success", text: "Person added to bill!" });
      setShowAddPerson(false);
      setSearchQuery("");
      setSearchResults([]);
      fetchBill();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error adding person" });
    }
    clearMsg();
  };

  // REMOVE PARTICIPANT
  const handleRemoveParticipant = (userId) => {
    showConfirm("Remove Participant", "This person will be removed from the bill and will no longer have access.", async () => {
      try {
        await api.post("/bills/remove-participant", { billId: id, userId });
        setMsg({ type: "success", text: "Person removed" });
        fetchBill();
      } catch (err) {
        setMsg({ type: "error", text: err.response?.data?.message || "Error removing person" });
      }
      clearMsg();
    });
  };

  // Toggle custom split user
  const toggleSplitUser = (userId) => {
    setExpenseForm(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(userId)
        ? prev.splitBetween.filter(id => id !== userId)
        : [...prev.splitBetween, userId]
    }));
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const myTotal = expenses.reduce((sum, e) => {
    const share = e.splitBetween?.find(s => s.userId?._id === user?._id);
    return sum + (share?.shareAmount ?? 0);
  }, 0);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
  if (!bill) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Messages */}
      {msg.text && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{bill.billName}</h2>
          <p className="text-sm text-gray-500">
            Host: {bill.hostId?.firstName} {bill.hostId?.lastName} | Code: <span className="font-mono font-bold text-blue-600">{bill.inviteCode}</span>
            <button onClick={() => { navigator.clipboard.writeText(bill.inviteCode); setMsg({ type: "success", text: "Code copied!" }); clearMsg(); }} className="ml-1 inline-block">
              <Copy className="w-3 h-3 inline text-gray-400 hover:text-blue-600" />
            </button>
          </p>
        </div>
          <div className="flex items-center gap-2">
            {isArchived ? (
              <span className="px-3 py-1 rounded-lg bg-gray-100 text-sm text-gray-600">Archived — read-only</span>
            ) : (
              <>
                {isHost && (
                  <>
                    <button onClick={() => { setShowEditBill(true); setEditBillName(bill.billName); }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm font-medium border border-gray-300 hover:border-gray-400">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => { setShowAddPerson(true); loadInitialUsers(); }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium border border-gray-300 hover:border-gray-400">
                      <UserPlus className="w-4 h-4" /> Add Person
                    </button>
                    <button onClick={handleArchiveBill} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 text-sm font-medium border border-gray-300 hover:border-gray-400">
                      <Archive className="w-4 h-4" /> Archive
                    </button>
                    <button onClick={handleDeleteBill} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium border border-gray-300 hover:border-gray-400">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
                <button onClick={() => setShowAddExpense(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4" /> Add Expense
                </button>
              </>
            )}
          </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-700">Participants ({bill.participants.length})</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {bill.participants.map((p, i) => (
            <div
              key={i}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium shadow-sm ${
                p.role === "host"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : p.userId?.accountType === "guest"
                    ? "bg-gray-100 text-gray-600 border border-gray-200"
                    : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              <span className="leading-none">
                {p.userId?.firstName} {p.userId?.lastName}
                {p.role === "host" && " (Host)"}
                {p.role === "guest" && p.userId?.accountType === "guest" && " (Guest)"}
              </span>
              {isHost && !isArchived && p.role !== "host" && (
                <button onClick={() => handleRemoveParticipant(p.userId?._id)} className="ml-2 -mr-1 bg-transparent hover:bg-green-200 rounded-full p-1 flex items-center justify-center">
                  <span className="sr-only">Remove</span>
                  <X className="w-3 h-3 text-green-700" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 mb-6 text-white">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8" />
          <div>
            <p className="text-sm opacity-80">Your Total Expenses</p>
            <p className="text-3xl font-bold">${myTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add Expense</h3>
              <button onClick={() => setShowAddExpense(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              {/* Expense Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expense Name</label>
                <input type="text" placeholder="e.g. Dinner, Groceries" value={expenseForm.expenseName} onChange={e => setExpenseForm({ ...expenseForm, expenseName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                <input type="number" step="0.01" min="0.01" placeholder="0.00" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              </div>

              {/* Paid By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Paid By</label>
                <select value={expenseForm.paidBy} onChange={e => setExpenseForm({ ...expenseForm, paidBy: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                  {bill.participants.map((p, i) => (
                    <option key={i} value={p.userId?._id}>{p.userId?.firstName} {p.userId?.lastName} {p.role === "host" ? "(Host)" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Split Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Split With</label>
                <div className="flex gap-3">
                  <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center text-sm font-medium transition-colors ${expenseForm.splitType === "equal" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" name="split" value="equal" checked={expenseForm.splitType === "equal"} onChange={e => setExpenseForm({ ...expenseForm, splitType: e.target.value, splitBetween: [] })} className="sr-only" />
                    Equally Divided
                  </label>
                  {bill.participants.length > 2 && (
                    <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center text-sm font-medium transition-colors ${expenseForm.splitType === "custom" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"}`}>
                      <input type="radio" name="split" value="custom" checked={expenseForm.splitType === "custom"} onChange={e => setExpenseForm({ ...expenseForm, splitType: e.target.value })} className="sr-only" />
                      Custom
                    </label>
                  )}
                </div>
              </div>

              {/* Custom split participants */}
              {expenseForm.splitType === "custom" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select who to split with:</label>
                  <div className="space-y-2">
                    {bill.participants.map((p, i) => (
                      <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${expenseForm.splitBetween.includes(p.userId?._id) ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                        <input type="checkbox" checked={expenseForm.splitBetween.includes(p.userId?._id)} onChange={() => toggleSplitUser(p.userId?._id)} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm">{p.userId?.firstName} {p.userId?.lastName}</span>
                      </label>
                    ))}
                  </div>
                  {expenseForm.splitBetween.length > 0 && expenseForm.amount && (
                    <p className="mt-2 text-sm text-gray-500">
                      Each person pays: <strong>${(parseFloat(expenseForm.amount) / expenseForm.splitBetween.length).toFixed(2)}</strong>
                    </p>
                  )}
                </div>
              )}

              {expenseForm.splitType === "equal" && expenseForm.amount && (
                <p className="text-sm text-gray-500">
                  Each person pays: <strong>${(parseFloat(expenseForm.amount) / bill.participants.length).toFixed(2)}</strong>
                </p>
              )}

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Add Expense</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Edit Bill</h3>
              <button onClick={() => setShowEditBill(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleEditBill}>
              <input type="text" placeholder="Bill name" value={editBillName} onChange={e => setEditBillName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none" autoFocus />
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
              <h3 className="text-lg font-bold text-gray-800">Add Person to "{bill.billName}"</h3>
              <button onClick={() => { setShowAddPerson(false); setSearchQuery(""); setSearchResults([]); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="relative mb-3">
              <input type="text" placeholder="Search users by name, email, or username..." value={searchQuery} onChange={e => handleSearch(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-4 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" autoFocus />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {searchResults
                .filter(u => !bill.participants.some(p => p.userId?._id === u._id))
                .map(u => (
                  <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <button onClick={() => handleAddParticipant(u._id)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700">Add</button>
                  </div>
                ))}
              {searchResults.filter(u => u.accountType !== "guest" && !bill.participants.some(p => p.userId?._id === u._id)).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No users found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Expenses</h3>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No details</p>
            <p className="text-gray-400 text-sm mt-1">Add expenses to see them here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses.map(expense => (
              <div key={expense._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{expense.expenseName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${expense.splitType === "equal" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {expense.splitType === "equal" ? "Equal" : "Custom"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Paid by <span className="font-medium text-gray-700">{expense.paidBy?.firstName} {expense.paidBy?.lastName}</span>
                    </p>
                    {/* Split details */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {expense.splitBetween.map((s, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {s.userId?.firstName} {s.userId?.lastName}: ${s.shareAmount?.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-800">${expense.amount.toFixed(2)}</span>
                      {isHost && !isArchived && (
                        <button onClick={() => handleDeleteExpense(expense._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Icon header */}
            <div className="flex flex-col items-center px-6 pt-8 pb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">{confirmModal.title}</h3>
              <p className="text-sm text-gray-500 text-center leading-relaxed">{confirmModal.message}</p>
            </div>
            {/* Buttons */}
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setConfirmModal({ open: false, title: "", message: "", onConfirm: null })}
                className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => { confirmModal.onConfirm(); setConfirmModal({ open: false, title: "", message: "", onConfirm: null }); }}
                className="flex-1 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
