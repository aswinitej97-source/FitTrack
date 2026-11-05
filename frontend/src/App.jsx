import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";

import WorkoutPlanner from "./pages/WorkoutPlanner";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ProgressComparison from "./pages/ProgressComparison";
import StreakTracker from "./pages/StreakTracker";
import Achievements from "./pages/Achievements";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";

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
    navigate("/login", { replace: true });
  };

  const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/workouts", label: "Workouts" },
    { path: "/goals", label: "Goals" },
    { path: "/analytics", label: "Analytics" },
    { path: "/notifications", label: "Notifications" },
    { path: "/workout-planner", label: "Workout Planner" },
    { path: "/exercise-library", label: "Exercise Library" },
    { path: "/progress-comparison", label: "Progress Comparison" },
    { path: "/streaks", label: "Streaks" },
    { path: "/achievements", label: "Achievements" },
    { path: "/personalized-dashboard", label: "My Dashboard" },
  ];

  return (
    <nav
      style={{
        display: "flex",
        gap: "15px",
        padding: "15px",
        background: "#1e293b",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {links.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          {item.label}
        </Link>
      ))}

      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workouts"
          element={
            <ProtectedRoute>
              <Workouts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workout-planner"
          element={
            <ProtectedRoute>
              <WorkoutPlanner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exercise-library"
          element={
            <ProtectedRoute>
              <ExerciseLibrary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress-comparison"
          element={
            <ProtectedRoute>
              <ProgressComparison />
            </ProtectedRoute>
          }
        />

        <Route
          path="/streaks"
          element={
            <ProtectedRoute>
              <StreakTracker />
            </ProtectedRoute>
          }
        />

        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/personalized-dashboard"
          element={
            <ProtectedRoute>
              <PersonalizedDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}