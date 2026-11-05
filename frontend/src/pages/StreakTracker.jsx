
import { useEffect, useState } from "react";
import axios from "axios";
import { Flame, Trophy, CalendarDays, RefreshCw } from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function StreakTracker() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStreak = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API}/streaks/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setStreak(response.data);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Session expired. Please login again."
          : "Unable to load streak details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreak();
  }, []);

  const cardStyle = {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    textAlign: "center",
  };

  return (
    <div
      style={{
        padding: "25px",
        background: "#f1f5f9",
        minHeight: "100vh",
        color: "#1e293b",
      }}
    >
      <h2>Workout Streak Tracker</h2>
      <p>Stay consistent and achieve your fitness goals.</p>

      <button
        onClick={loadStreak}
        disabled={loading}
        style={{ marginBottom: "25px" }}
      >
        <RefreshCw size={16} style={{ marginRight: "8px" }} />
        Refresh Streak
      </button>

      {loading && <p>Loading streak details...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && streak && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "25px",
            }}
          >
            <div style={cardStyle}>
              <Flame size={42} color="#f97316" />

              <h3>Current Streak</h3>

              <h1>{streak.current_streak} Days</h1>

              <p>Keep your workout streak alive!</p>
            </div>

            <div style={cardStyle}>
              <Trophy size={42} color="#eab308" />

              <h3>Longest Streak</h3>

              <h1>{streak.longest_streak} Days</h1>

              <p>Your personal best</p>
            </div>

            <div style={cardStyle}>
              <CalendarDays size={42} color="#2563eb" />

              <h3>Last Workout</h3>

              <h2>{streak.last_workout_date || "Not yet"}</h2>

              <p>Most recent workout date</p>
            </div>
          </div>

          <div style={cardStyle}>
            <h3>Streak Status</h3>

            <p
              style={{
                color:
                  streak.status === "Active"
                    ? "#16a34a"
                    : "#dc2626",
                fontWeight: "bold",
              }}
            >
              {streak.status}
            </p>

            {streak.current_streak >= 7 ? (
              <p>Excellent! You achieved a 7-day streak!</p>
            ) : streak.current_streak >= 3 ? (
              <p>Great progress! Keep going!</p>
            ) : streak.current_streak > 0 ? (
              <p>Good start! Stay consistent every day.</p>
            ) : (
              <p>Complete a workout to start your streak.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
