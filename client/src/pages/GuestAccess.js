import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Receipt,
  Users,
  AlertCircle,
  CheckCircle,
  UserPlus,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  DollarSign
} from "lucide-react";

export default function GuestAccess() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [bill, setBill] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Guest registration modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [modalStep, setModalStep] = useState("email"); // "email" | "register"
  const [emailCheck, setEmailCheck] = useState("");
  const [emailCheckMsg, setEmailCheckMsg] = useState({ type: "", text: "" });
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [regForm, setRegForm] = useState({ firstName: "", lastName: "", email: "" });
  const [regMsg, setRegMsg] = useState({ type: "", text: "" });
  const [regLoading, setRegLoading] = useState(false);
  const [joinedBill, setJoinedBill] = useState(null); // full bill data after join
  const [joinedExpenses, setJoinedExpenses] = useState([]);

  // Guest identification
  const [guestEmail, setGuestEmail] = useState("");
  const [guestAccess, setGuestAccess] = useState(null); // { minutesRemaining }
  const [accessMsg, setAccessMsg] = useState({ type: "", text: "" });
  const [accessLoading, setAccessLoading] = useState(false);

  // Upgrade form
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({ username: "", nickname: "", password: "", confirmPassword: "" });
  const [upgradeMsg, setUpgradeMsg] = useState({ type: "", text: "" });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setMsg("");
    setBill(null);
    setJoinedBill(null);
    setJoinedExpenses([]);
    setGuestAccess(null);
    setAccessMsg({ type: "", text: "" });
    setShowUpgrade(false);
    setUpgradeSuccess(false);
    setRegForm({ firstName: "", lastName: "", email: "" });
    setRegMsg({ type: "", text: "" });
    setEmailCheck("");
    setEmailCheckMsg({ type: "", text: "" });
    setModalStep("email");
    try {
      const res = await axios.get(`http://localhost:5000/api/bills/code/${code.trim().toUpperCase()}`);
      setBill(res.data);
      setShowRegModal(true);
    } catch (err) {
      setMsg(err.response?.data?.message || "No bill found with this code");
    }
    setLoading(false);
  };

  const handleEmailCheck = async (e) => {
    e.preventDefault();
    if (!emailCheck.trim() || !bill) return;
    setEmailCheckLoading(true);
    setEmailCheckMsg({ type: "", text: "" });
    try {
      const res = await axios.get(
        `http://localhost:5000/api/bills/code/${bill.inviteCode}?email=${encodeURIComponent(emailCheck.trim())}`
      );
      if (res.data.guestAccess) {
        // Email is already a participant — grant access immediately
        setGuestEmail(emailCheck.trim());
        setGuestAccess(res.data.guestAccess);
        setJoinedBill(res.data);
        setShowRegModal(false);
        try {
          const expRes = await axios.get(`http://localhost:5000/api/expenses/public/bill/${res.data._id}`);
          setJoinedExpenses(expRes.data);
        } catch {}
      }
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setEmailCheckMsg({ type: "error", text: err.response.data.message });
      } else if (err.response?.data?.registeredUser) {
        // Email belongs to a registered (non-guest) account — block registration
        setEmailCheckMsg({ type: "error", text: err.response.data.message });
      } else if (
        err.response?.status === 404 ||
        (err.response?.status === 403 && !err.response?.data?.limitReached)
      ) {
        // Email not on this bill — move to registration step
        setRegForm(f => ({ ...f, email: emailCheck.trim() }));
        setModalStep("register");
      } else {
        setEmailCheckMsg({ type: "error", text: err.response?.data?.message || "Could not verify email" });
      }
    }
    setEmailCheckLoading(false);
  };

  const handleGuestRegister = async (e) => {
    e.preventDefault();
    if (!regForm.firstName.trim() || !regForm.lastName.trim() || !regForm.email.trim()) return;
    setRegLoading(true);
    setRegMsg({ type: "", text: "" });
    try {
      // Register guest + add as participant in one call
      const joinRes = await axios.post("http://localhost:5000/api/bills/join", {
        inviteCode: bill.inviteCode,
        firstName: regForm.firstName.trim(),
        lastName: regForm.lastName.trim(),
        email: regForm.email.trim()
      });
      const email = regForm.email.trim();
      setGuestEmail(email);
      setBill(joinRes.data.bill);
      setJoinedBill(joinRes.data.bill);

      // Auto-identify to get guestAccess and load expenses
      try {
        const accessRes = await axios.get(
          `http://localhost:5000/api/bills/code/${joinRes.data.bill.inviteCode}?email=${encodeURIComponent(email)}`
        );
        if (accessRes.data.guestAccess) {
          setGuestAccess(accessRes.data.guestAccess);
          try {
            const expRes = await axios.get(`http://localhost:5000/api/expenses/public/bill/${joinRes.data.bill._id}`);
            setJoinedExpenses(expRes.data);
          } catch {}
        }
      } catch {}

      setShowRegModal(false);
    } catch (err) {
      setRegMsg({ type: "error", text: err.response?.data?.message || "Could not join bill. Please check your details." });
    }
    setRegLoading(false);
  };

  const handleGuestIdentify = async (e) => {
    e.preventDefault();
    if (!guestEmail.trim() || !bill) return;
    setAccessLoading(true);
    setAccessMsg({ type: "", text: "" });
    setGuestAccess(null);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/bills/code/${bill.inviteCode}?email=${encodeURIComponent(guestEmail.trim())}`
      );
      if (res.data.guestAccess) {
        setGuestAccess(res.data.guestAccess);
        setAccessMsg({ type: "success", text: "Identified! See your remaining access time below." });
        try {
          const billId = joinedBill ? joinedBill._id : bill._id;
          const expRes = await axios.get(`http://localhost:5000/api/expenses/public/bill/${billId}`);
          setJoinedExpenses(expRes.data);
        } catch {}
      }
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setAccessMsg({ type: "error", text: err.response.data.message });
      } else {
        setAccessMsg({ type: "error", text: err.response?.data?.message || "Could not identify guest" });
      }
    }
    setAccessLoading(false);
  };

  const handleUpgrade = async (e) => {
    e.preventDefault();
    const { username, nickname, password, confirmPassword } = upgradeForm;
    setUpgradeLoading(true);
    setUpgradeMsg({ type: "", text: "" });
    try {
      await axios.post("http://localhost:5000/api/auth/upgrade-guest", {
        email: guestEmail,
        username,
        nickname,
        password,
        confirmPassword
      });
      setUpgradeSuccess(true);
      setUpgradeMsg({ type: "success", text: "Account upgraded successfully! Redirecting to login..." });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setUpgradeMsg({ type: "error", text: err.response?.data?.message || "Error upgrading account" });
    }
    setUpgradeLoading(false);
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const viewBill = joinedBill || bill;

  // Find the guest's userId from participants (matched by email)
  const guestParticipant = viewBill?.participants?.find(
    p => p.userId?.email?.toLowerCase() === guestEmail.toLowerCase()
  );
  const guestUserId = guestParticipant?.userId?._id;

  // Sum only the guest's share across all expenses
  const myGuestTotal = joinedExpenses.reduce((sum, e) => {
    const share = e.splitBetween?.find(s => s.userId?._id === guestUserId);
    return sum + (share?.shareAmount ?? 0);
  }, 0);

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
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{msg}</span>
          </div>
        )}

        {/* Guest Access Modal */}
        {showRegModal && bill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {modalStep === "email" ? "Verify Your Email" : "Guest Registration"}
                </h3>
                <button onClick={() => setShowRegModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {modalStep === "email" ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    You found <strong className="text-gray-700">{bill.billName}</strong>. Enter your email to check if you're already on this bill.
                  </p>
                  <form onSubmit={handleEmailCheck} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={emailCheck}
                        onChange={e => setEmailCheck(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                        autoFocus
                      />
                    </div>
                    {emailCheckMsg.text && (
                      <div className={`flex items-center gap-2 text-sm ${emailCheckMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {emailCheckMsg.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={emailCheckLoading}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {emailCheckLoading ? "Checking..." : "Continue"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Your email isn't on this bill yet. Fill in your details to join <strong className="text-gray-700">{bill.billName}</strong>.
                  </p>
                  <form onSubmit={handleGuestRegister} className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                        <input
                          type="text"
                          placeholder="First Name"
                          value={regForm.firstName}
                          onChange={e => setRegForm({ ...regForm, firstName: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                          autoFocus
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={regForm.lastName}
                          onChange={e => setRegForm({ ...regForm, lastName: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={regForm.email}
                        onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                        required
                      />
                    </div>
                    {regMsg.text && (
                      <div className={`flex items-center gap-2 text-sm ${regMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {regMsg.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {regLoading ? "Saving..." : "Join Bill"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setModalStep("email"); setRegMsg({ type: "", text: "" }); }}
                      className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
                    >
                      ← Back
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* After identifying: show full bill + expenses view */}
        {guestAccess && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-bold">{viewBill.billName}</h2>
              <p className="text-blue-100 mt-1">Host: {viewBill.hostId?.firstName} {viewBill.hostId?.lastName}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                  Viewing as guest: <strong>{guestEmail}</strong>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  {formatTime(guestAccess.minutesRemaining)} remaining today
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Participants */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-700">Participants ({viewBill.participants?.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {viewBill.participants?.map((p, i) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${
                      p.role === "host" ? "bg-blue-100 text-blue-700" :
                      p.role === "guest" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"
                    }`}>
                      {p.userId?.firstName} {p.userId?.lastName}
                      {p.role === "host" && " (Host)"}
                      {p.role === "guest" && " (Guest)"}
                    </span>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white flex items-center gap-3">
                <DollarSign className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-80">Your Total Expenses</p>
                  <p className="text-3xl font-bold">${myGuestTotal.toFixed(2)}</p>
                </div>
              </div>

              {/* Expenses */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Receipt className="w-4 h-4" /> Expenses</h3>
                </div>
                {joinedExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">No expenses yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {joinedExpenses.map(expense => (
                      <div key={expense._id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-800">{expense.expenseName}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                expense.splitType === "equal" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                              }`}>
                                {expense.splitType === "equal" ? "Equal" : "Custom"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              Paid by <span className="font-medium text-gray-700">{expense.paidBy?.firstName} {expense.paidBy?.lastName}</span>
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {expense.splitBetween?.map((s, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {s.userId?.firstName} {s.userId?.lastName}: ${s.shareAmount?.toFixed(2)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-lg font-bold text-gray-800">${expense.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upgrade banner */}
              {!upgradeSuccess && (
                <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-indigo-800 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Upgrade Your Account</h4>
                    <button onClick={() => setShowUpgrade(v => !v)} className="text-xs text-indigo-600 font-medium hover:text-indigo-800 underline">
                      {showUpgrade ? "Cancel" : "Upgrade Now"}
                    </button>
                  </div>
                  <p className="text-sm text-indigo-700">Remove the 6-hour daily limit and get full access.</p>
                  {showUpgrade && (
                    <form onSubmit={handleUpgrade} className="mt-4 space-y-3">
                      <div className="bg-white rounded-lg px-3 py-2 text-xs text-gray-500 border border-gray-200">
                        Using guest account: <strong>{guestEmail}</strong>
                      </div>
                      <input type="text" placeholder="Choose a username" value={upgradeForm.username} onChange={e => setUpgradeForm({ ...upgradeForm, username: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                      <input type="text" placeholder="Choose a nickname" value={upgradeForm.nickname} onChange={e => setUpgradeForm({ ...upgradeForm, nickname: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password (8-16 chars, upper, lower, number, special)" value={upgradeForm.password} onChange={e => setUpgradeForm({ ...upgradeForm, password: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-2.5 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                      <div className="relative">
                        <input type={showConfirm ? "text" : "password"} placeholder="Confirm password" value={upgradeForm.confirmPassword} onChange={e => setUpgradeForm({ ...upgradeForm, confirmPassword: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-2.5 text-gray-400">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                      {upgradeMsg.text && (
                        <div className={`flex items-center gap-2 text-sm ${upgradeMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                          {upgradeMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {upgradeMsg.text}
                        </div>
                      )}
                      <button type="submit" disabled={upgradeLoading} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        {upgradeLoading ? "Upgrading..." : "Upgrade Account"}
                      </button>
                    </form>
                  )}
                </div>
              )}
              {upgradeSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Account upgraded successfully!</p>
                    <p className="text-xs text-green-700 mt-0.5">You can now <Link to="/login" className="underline font-medium">log in</Link> with your credentials.</p>
                  </div>
                </div>
              )}
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

