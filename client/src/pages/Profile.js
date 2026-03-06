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
  CheckCircle
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
                  <button onClick={handleUpgradePremium} disabled={upgrading} className="mt-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-600 transition-all disabled:opacity-50 text-sm">
                    {upgrading ? "Upgrading..." : "Upgrade Now"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
