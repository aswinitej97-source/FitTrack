
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API = "http://127.0.0.1:8000";

export default function ProgressComparison() {
  const [period, setPeriod] = useState("weekly");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadComparison() {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${API}/progress-comparison/${period}`,
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (active) setComparison(response.data);
      } catch (err) {
        if (active) {
          setError("Unable to load progress comparison.");
          setComparison(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadComparison();

    return () => {
      active = false;
    };
  }, [period]);

  const metrics = [
    {
      key: "total_workouts",
      label: "Total Workouts",
      unit: "",
    },
    {
      key: "total_duration",
      label: "Workout Duration",
      unit: "min",
    },
    {
      key: "total_calories",
      label: "Calories Burned",
      unit: "kcal",
    },
  ];

  const chartData = comparison
    ? metrics.map((metric) => ({
        name: metric.label,
        Previous: comparison[metric.key]?.previous ?? 0,
        Current: comparison[metric.key]?.current ?? 0,
      }))
    : [];

  const getInsight = (metric) => {
    const stats = comparison?.[metric.key];

    if (!stats) return "No data";

    const { current, previous, change_percentage } = stats;

    if (previous === 0 && current > 0) {
      return "New activity recorded";
    }

    if (current === previous) {
      return "No change";
    }

    if (current > previous) {
      return `Improved by ${change_percentage}%`;
    }

    return `Decreased by ${Math.abs(change_percentage)}%`;
  };

  const cardStyle = {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
      <h2>Progress Comparison</h2>
      <p>Compare your fitness performance over time.</p>

      <div style={{ marginBottom: "25px" }}>
        <button
          onClick={() => setPeriod("weekly")}
          disabled={period === "weekly"}
        >
          Weekly
        </button>

        <button
          onClick={() => setPeriod("monthly")}
          disabled={period === "monthly"}
          style={{ marginLeft: "10px" }}
        >
          Monthly
        </button>
      </div>

      {loading && <p>Loading comparison...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && comparison && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
              marginBottom: "25px",
            }}
          >
            {metrics.map((metric) => {
              const stats = comparison[metric.key];

              return (
                <div key={metric.key} style={cardStyle}>
                  <h3>{metric.label}</h3>

                  <p>
                    Previous: {stats?.previous ?? 0} {metric.unit}
                  </p>

                  <p>
                    Current: {stats?.current ?? 0} {metric.unit}
                  </p>

                  <strong>{getInsight(metric)}</strong>
                </div>
              );
            })}
          </div>

          <div style={cardStyle}>
            <h3>
              {period === "weekly" ? "Weekly" : "Monthly"} Comparison
            </h3>

            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="Previous"
                    fill="#94a3b8"
                  />

                  <Bar
                    dataKey="Current"
                    fill="#2563eb"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
