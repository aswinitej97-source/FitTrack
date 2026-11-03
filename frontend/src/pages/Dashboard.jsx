
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const loadDashboard = async () => {
      try {
        const [progressRes, weeklyRes] = await Promise.all([
          axios.get(`${API}/progress/daily`, config),
          axios.get(`${API}/analytics/weekly`, config),
        ]);

        setProgress(progressRes.data);
        setWeekly(weeklyRes.data);
      } catch (err) {
        setError("Unable to load dashboard data.");
        console.error(err);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div style={{ padding: "25px" }}>
      <h1>FitTrack Dashboard</h1>
      <p>Welcome to your Fitness Management Platform!</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Today's Progress</h2>
      {progress ? (
        <pre>{JSON.stringify(progress, null, 2)}</pre>
      ) : (
        <p>Loading progress...</p>
      )}

      <h2>Weekly Analytics</h2>
      {weekly ? (
        <pre>{JSON.stringify(weekly, null, 2)}</pre>
      ) : (
        <p>Loading analytics...</p>
      )}
    </div>
  );
}
