
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function AdvancedAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/advanced-analytics/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load advanced analytics");
      }

      setData(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const cardStyle = {
    background: "#f1f5f9",
    padding: "20px",
    borderRadius: "10px",
    minWidth: "180px",
    flex: 1,
  };

  const maxWorkouts = Math.max(
    1,
    ...(data?.weekly_trend || []).map((item) => item.workouts || 0)
  );

  return (
    <div style={{ padding: "25px", maxWidth: "1100px", margin: "auto" }}>
      <h1>Advanced Analytics Dashboard</h1>
      <p>
        Monitor workout consistency, weekly trends,
        calories and fitness goal completion.
      </p>

      <button onClick={loadAnalytics}>Refresh Analytics</button>

      {loading && <p>Loading analytics...</p>}
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
              ["Total Workouts", data.total_workouts_30_days],
              ["Calories Burned", data.total_calories_burned],
              ["Consistency", `${data.consistency_percentage}%`],
              ["Goal Completion", `${data.goal_completion_percentage}%`],
            ].map(([label, value]) => (
              <div key={label} style={cardStyle}>
                <h3>{label}</h3>
                <h2>{value ?? 0}</h2>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "30px" }}>
            Weekly Workout Trend
          </h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              height: "260px",
              padding: "20px",
              background: "#f8fafc",
              borderRadius: "12px",
              overflowX: "auto",
            }}
          >
            {data.weekly_trend?.map((item, index) => (
              <div
                key={`${item.date}-${index}`}
                style={{
                  flex: 1,
                  minWidth: "55px",
                  textAlign: "center",
                }}
              >
                <strong>{item.workouts}</strong>

                <div
                  style={{
                    height: `${
                      ((item.workouts || 0) / maxWorkouts) * 180
                    }px`,
                    background: "#2563eb",
                    borderRadius: "6px 6px 0 0",
                    marginTop: "8px",
                  }}
                />

                <small>{item.date}</small>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "30px" }}>
            Goal Progress
          </h2>

          <div
            style={{
              background: "#e2e8f0",
              borderRadius: "20px",
              overflow: "hidden",
              height: "25px",
            }}
          >
            <div
              style={{
                width: `${
                  Math.min(
                    100,
                    Math.max(0, data.goal_completion_percentage || 0)
                  )
                }%`,
                height: "100%",
                background: "#16a34a",
              }}
            />
          </div>

          <p>
            {data.goal_completion_percentage ?? 0}% of goals completed
          </p>

          <h2>Fitness Insights</h2>

          {Array.isArray(data.insights) && data.insights.length > 0 ? (
            <ul>
              {data.insights.map((insight, index) => (
                <li key={index} style={{ marginBottom: "10px" }}>
                  {insight}
                </li>
              ))}
            </ul>
          ) : (
            <p>No insights available yet.</p>
          )}
        </>
      )}
    </div>
  );
}
