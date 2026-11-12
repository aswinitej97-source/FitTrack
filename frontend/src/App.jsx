
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

// Phase 2
import WorkoutPlanner from "./pages/WorkoutPlanner";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ProgressComparison from "./pages/ProgressComparison";
import StreakTracker from "./pages/StreakTracker";
import Achievements from "./pages/Achievements";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";

// Phase 3
import Nutrition from "./pages/Nutrition";
import WaterTracker from "./pages/WaterTracker";
import AIRecommendations from "./pages/AIRecommendations";
import WorkoutTimer from "./pages/WorkoutTimer";
import ActivitySync from "./pages/ActivitySync";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Reminders from "./pages/Reminders";

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

    // Phase 2
    { path: "/workout-planner", label: "Workout Planner" },
    { path: "/exercise-library", label: "Exercise Library" },
    { path: "/progress-comparison", label: "Progress Comparison" },
    { path: "/streaks", label: "Streaks" },
    { path: "/achievements", label: "Achievements" },
    { path: "/personalized-dashboard", label: "My Dashboard" },

    // Phase 3
    { path: "/nutrition", label: "Nutrition" },
    { path: "/water-tracker", label: "Water Tracker" },
    { path: "/ai-recommendations", label: "AI Recommendations" },
    { path: "/workout-timer", label: "Workout Timer" },
    { path: "/activity-sync", label: "Activity Sync" },
    { path: "/advanced-analytics", label: "Advanced Analytics" },
    { path: "/reminders", label: "Reminders" },
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
  const protectedPage = (page) => (
    <ProtectedRoute>{page}</ProtectedRoute>
  );

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Phase 1 */}
        <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
        <Route path="/workouts" element={protectedPage(<Workouts />)} />
        <Route path="/goals" element={protectedPage(<Goals />)} />
        <Route path="/analytics" element={protectedPage(<Analytics />)} />
        <Route path="/notifications" element={protectedPage(<Notifications />)} />

        {/* Phase 2 */}
        <Route path="/workout-planner" element={protectedPage(<WorkoutPlanner />)} />
        <Route path="/exercise-library" element={protectedPage(<ExerciseLibrary />)} />
        <Route path="/progress-comparison" element={protectedPage(<ProgressComparison />)} />
        <Route path="/streaks" element={protectedPage(<StreakTracker />)} />
        <Route path="/achievements" element={protectedPage(<Achievements />)} />
        <Route path="/personalized-dashboard" element={protectedPage(<PersonalizedDashboard />)} />

        {/* Phase 3 */}
        <Route path="/nutrition" element={protectedPage(<Nutrition />)} />
        <Route path="/water-tracker" element={protectedPage(<WaterTracker />)} />
        <Route path="/ai-recommendations" element={protectedPage(<AIRecommendations />)} />
        <Route path="/workout-timer" element={protectedPage(<WorkoutTimer />)} />
        <Route path="/activity-sync" element={protectedPage(<ActivitySync />)} />
        <Route path="/advanced-analytics" element={protectedPage(<AdvancedAnalytics />)} />
        <Route path="/reminders" element={protectedPage(<Reminders />)} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
