
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function PersonalizedDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(
          `${API}/personalized-dashboard/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        setData(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div style={{ padding: "25px" }}>
      <h1>Personalized Fitness Dashboard</h1>

      {loading && <p>Loading dashboard...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <pre
          style={{
            background: "#f1f5f9",
            padding: "20px",
            borderRadius: "10px",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
