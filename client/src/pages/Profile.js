import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  UserCircle,
  Mail,
  AtSign,
  Crown,
  Shield,
  Pencil,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Lock,
  Sparkles
} from "lucide-react";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    nickname: user?.nickname || ""
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [upgrading, setUpgrading] = useState(false);

  // --- NEW: Fake upgrade flow states ---
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ cardNumber: "", expiry: "", cvv: "", name: "" });
  const [paymentError, setPaymentError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const clearMsg = () => setTimeout(() => setMsg({ type: "", text: "" }), 3000);

  const handleSave = async () => {
    try {
      await api.put("/auth/profile", form);
      setMsg({ type: "success", text: "Profile updated!" });
      setEditing(false);
      refreshUser();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error updating profile" });
    }
    clearMsg();
  };

  const handleUpgradePremium = async () => {
    setUpgrading(true);
    try {
      await api.put("/auth/upgrade-premium");
      setMsg({ type: "success", text: "Upgraded to Premium!" });
      refreshUser();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error upgrading" });
    }
    setUpgrading(false);
    clearMsg();
  };

  // --- NEW: Fake payment handlers ---
  const formatCardNumber = (val) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleFakePayment = async (e) => {
    e.preventDefault();
    setPaymentError("");
    const raw = paymentForm.cardNumber.replace(/\s/g, "");
    if (raw.length < 16) return setPaymentError("Please enter a valid 16-digit card number.");
    if (paymentForm.expiry.length < 5) return setPaymentError("Please enter a valid expiry date.");
    if (paymentForm.cvv.length < 3) return setPaymentError("Please enter a valid CVV.");
    if (!paymentForm.name.trim()) return setPaymentError("Please enter the cardholder name.");

    setProcessingPayment(true);
    await new Promise(r => setTimeout(r, 2200)); // fake processing delay
    setProcessingPayment(false);
    setShowPaymentModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessConfirm = async () => {
    setShowSuccessModal(false);
    await handleUpgradePremium();
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {msg.text && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <UserCircle className="w-16 h-16 text-gray-300" />
            </div>
          </div>
        </div>

        <div className="pt-16 px-6 pb-6">
          {/* Name & Type */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-500">@{user.username}</p>
              <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium capitalize ${
                user.accountType === "premium" ? "bg-yellow-100 text-yellow-700" : user.accountType === "standard" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}>
                {user.accountType === "premium" ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                {user.accountType}
              </span>
            </div>
            {!editing ? (
              <button onClick={() => { setEditing(true); setForm({ firstName: user.firstName, lastName: user.lastName, nickname: user.nickname || "" }); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium">
                <Pencil className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                {editing ? (
                  <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                ) : (
                  <p className="text-gray-800 font-medium">{user.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                {editing ? (
                  <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                ) : (
                  <p className="text-gray-800 font-medium">{user.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nickname</label>
              {editing ? (
                <input type="text" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              ) : (
                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-800 font-medium">{user.nickname || "—"}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-800 font-medium">{user.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Username</label>
              <p className="text-gray-800 font-medium">@{user.username}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Member Since</label>
              <p className="text-gray-800 font-medium">{new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          {/* Upgrade to Premium */}
          {user.accountType === "standard" && (
            <div className="mt-8 p-5 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Crown className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-800">Upgrade to Premium</h3>
                  <p className="text-sm text-gray-600 mt-1">Unlock unlimited bills, unlimited participants per bill, and more!</p>
                  {/* CHANGED: opens confirm modal instead of direct upgrade */}
                  <button onClick={() => setShowUpgradeModal(true)} disabled={upgrading} className="mt-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-600 transition-all disabled:opacity-50 text-sm">
                    {upgrading ? "Upgrading..." : "Upgrade Now"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── NEW: Step 1 — Upgrade Confirm Modal ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-5 text-center">
              <Crown className="w-10 h-10 text-white mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">Go Premium</h3>
              <p className="text-yellow-100 text-sm mt-1">One-time upgrade — no subscriptions</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                "Unlimited bills per month",
                "Unlimited participants per bill",
                "Priority support",
                "Premium badge on your profile"
              ].map((perk, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {perk}
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 text-center">
                <span className="text-3xl font-bold text-gray-800">$9.99</span>
                <span className="text-gray-500 text-sm ml-1">one-time</span>
              </div>
            </div>
            <div className="flex border-t border-gray-100">
              <button onClick={() => setShowUpgradeModal(false)} className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100">
                Maybe Later
              </button>
              <button onClick={() => { setShowUpgradeModal(false); setShowPaymentModal(true); }} className="flex-1 py-3.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Step 2 — Fake Payment Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Payment Details</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleFakePayment} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={paymentForm.name}
                  onChange={e => setPaymentForm({ ...paymentForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={e => setPaymentForm({ ...paymentForm, cardNumber: formatCardNumber(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentForm.expiry}
                    onChange={e => setPaymentForm({ ...paymentForm, expiry: formatExpiry(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    value={paymentForm.cvv}
                    onChange={e => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, "") })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              {paymentError && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{paymentError}</p>
              )}

              <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
                <Lock className="w-3.5 h-3.5" />
                Your payment info is encrypted and secure
              </div>

              <button
                type="submit"
                disabled={processingPayment}
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-600 transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay $9.99</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── NEW: Step 3 — Success Modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center">
            <div className="px-6 pt-8 pb-5">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Payment Successful!</h3>
              <p className="text-sm text-gray-500">Welcome to Premium. Your account has been upgraded.</p>
            </div>
            <div className="px-6 pb-6">
              <button onClick={handleSuccessConfirm} className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-600 transition-all text-sm">
                Awesome, let's go!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}