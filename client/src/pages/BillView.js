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
  const [msg, setMsg] = useState({ type: "", text: "" });

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
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      setMsg({ type: "success", text: "Expense deleted" });
      fetchExpenses();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error deleting expense" });
    }
    clearMsg();
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
        <button onClick={() => setShowAddExpense(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-700">Participants ({bill.participants.length})</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {bill.participants.map((p, i) => (
            <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${p.role === "host" ? "bg-blue-100 text-blue-700" : p.role === "guest" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
              {p.userId?.firstName} {p.userId?.lastName}
              {p.role === "host" && " (Host)"}
              {p.role === "guest" && " (Guest)"}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 mb-6 text-white">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8" />
          <div>
            <p className="text-sm opacity-80">Total Expenses</p>
            <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
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
                  <option value="">-- Host (default) --</option>
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
                    {isHost && (
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
    </div>
  );
}
