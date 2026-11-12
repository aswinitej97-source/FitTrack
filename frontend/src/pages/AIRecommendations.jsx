
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function AIRecommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecommendations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/ai/recommendations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load workout recommendations");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  return (
    <div
      style={{
        padding: "25px",
        maxWidth: "1100px",
        margin: "auto",
      }}
    >
      <h1>AI Workout Recommendations</h1>
      <p>
        Personalized workout suggestions based on your
        fitness goals, workout history and streak.
      </p>

      <button onClick={loadRecommendations}>
        Refresh Recommendations
      </button>

      {loading && <p>Loading recommendations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && data && (
        <>
          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              marginTop: "25px",
            }}
          >
            {[
              ["Fitness Goal", data.goal?.replaceAll("_", " ")],
              ["Recent Workouts", data.recent_workouts],
              ["Average Duration", `${data.average_duration} min`],
              ["Current Streak", `${data.current_streak} days`],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: "#f1f5f9",
                  padding: "20px",
                  borderRadius: "10px",
                  minWidth: "180px",
                }}
              >
                <h3>{label}</h3>
                <h2>{value}</h2>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "30px" }}>
            Recommended Workouts
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {data.recommendations?.map((workout, index) => (
              <div
                key={`${workout.name}-${index}`}
                style={{
                  padding: "25px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <h2>{workout.name}</h2>
                <p><strong>Category:</strong> {workout.category}</p>
                <p><strong>Duration:</strong> {workout.duration} min</p>
                <p><strong>Difficulty:</strong> {workout.difficulty}</p>
                <p><strong>Why recommended?</strong></p>
                <p>{workout.reason}</p>
              </div>
            ))}
          </div>

          {data.recommendations?.length === 0 && (
            <p>No workout recommendations available.</p>
          )}
        </>
      )}
    </div>
  );
}
