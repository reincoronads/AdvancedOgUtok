import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  Archive,
  UserCircle,
  LogOut,
  Menu,
  X,
  Wallet,
  Crown,
  Clock
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Bills", icon: Receipt },
  { path: "/dashboard/archive", label: "Archive", icon: Archive },
  { path: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const INACTIVITY_LIMIT = 30_000; // 30 seconds
  const WARNING_BEFORE = 5_000;    // warn 5 seconds before logout

  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);
  const countdownInterval = useRef(null);

  const doLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const resetTimers = useCallback(() => {
    // If warning is showing, hide it
    setShowTimeoutWarning(false);
    clearTimeout(logoutTimer.current);
    clearTimeout(warningTimer.current);
    clearInterval(countdownInterval.current);

    // Start warning timer
    warningTimer.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      setCountdown(5);
      let c = 5;
      countdownInterval.current = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) clearInterval(countdownInterval.current);
      }, 1000);
    }, INACTIVITY_LIMIT - WARNING_BEFORE);

    // Start logout timer
    logoutTimer.current = setTimeout(() => {
      doLogout();
    }, INACTIVITY_LIMIT);
  }, [doLogout]);

  // Attach activity listeners
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    const handleActivity = () => resetTimers();

    events.forEach(e => window.addEventListener(e, handleActivity));
    resetTimers(); // start on mount

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearTimeout(logoutTimer.current);
      clearTimeout(warningTimer.current);
      clearInterval(countdownInterval.current);
    };
  }, [resetTimers]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const accountBadge = user?.accountType === "premium"
    ? "bg-yellow-100 text-yellow-700"
    : user?.accountType === "standard"
    ? "bg-blue-100 text-blue-700"
    : "bg-gray-100 text-gray-600";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Inactivity Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-full mb-4">
              <Clock className="w-7 h-7 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Session Expiring</h3>
            <p className="text-gray-500 text-sm mb-4">
              You've been inactive. You will be logged out in{" "}
              <span className="font-bold text-red-600">{countdown}</span> second{countdown !== 1 ? "s" : ""}.
            </p>
            <button
              onClick={resetTimers}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">SplitBill</span>
          </Link>
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-500 truncate">@{user?.username}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${accountBadge}`}>
            {user?.accountType === "premium" && <Crown className="w-3 h-3 inline mr-1" />}
            {user?.accountType}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 sticky top-0 z-30">
          <button className="lg:hidden mr-3 text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {navItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
