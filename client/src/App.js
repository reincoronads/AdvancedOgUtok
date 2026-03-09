import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword"; // Added this
import VerifyEmail from "./pages/VerifyEmail";     // Added this
import GuestAccess from "./pages/GuestAccess";
import Bills from "./pages/Bills";
import BillView from "./pages/BillView";
import ArchivePage from "./pages/ArchivePage";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* Added this */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />     {/* Added this */}
          <Route path="/guest" element={<GuestAccess />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Bills /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/bill/:id" element={<ProtectedRoute><DashboardLayout><BillView /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/archive" element={<ProtectedRoute><DashboardLayout><ArchivePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;