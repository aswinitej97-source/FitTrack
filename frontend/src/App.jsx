
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) return null;

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "15px",
        background: "#1e293b",
        flexWrap: "wrap",
      }}
    >
      <Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link>
      <Link to="/workouts" style={{ color: "white" }}>Workouts</Link>
      <Link to="/goals" style={{ color: "white" }}>Goals</Link>
      <Link to="/analytics" style={{ color: "white" }}>Analytics</Link>
      <Link to="/notifications" style={{ color: "white" }}>Notifications</Link>

      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />

        <Route
          path="/workouts"
          element={<ProtectedRoute><Workouts /></ProtectedRoute>}
        />

        <Route
          path="/goals"
          element={<ProtectedRoute><Goals /></ProtectedRoute>}
        />

        <Route
          path="/analytics"
          element={<ProtectedRoute><Analytics /></ProtectedRoute>}
        />

        <Route
          path="/notifications"
          element={<ProtectedRoute><Notifications /></ProtectedRoute>}
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
