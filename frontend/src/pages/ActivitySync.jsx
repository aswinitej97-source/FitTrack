
import { useState } from "react";

const API = "http://127.0.0.1:8000";

export default function ActivitySync() {
  const [form, setForm] = useState({
    source: "Manual",
    steps: "",
    duration_minutes: "",
    activity_date: new Date().toLocaleDateString("en-CA"),
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/activity-sync/manual`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: form.source,
          steps: Number(form.steps),
          duration_minutes: Number(form.duration_minutes),
          activity_date: form.activity_date,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to import activity");
      }

      const result = await response.json();

      setMessage(
        `Activity saved! ${result.steps} steps and ${result.estimated_calories} estimated kcal.`
      );

      setForm({
        ...form,
        steps: "",
        duration_minutes: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "25px", maxWidth: "650px", margin: "auto" }}>
      <h1>Activity Sync</h1>
      <p>
        Manually import step counts and activity duration
        into your FitTrack workout history.
      </p>

      <div
        style={{
          padding: "25px",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          background: "#f8fafc",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "18px" }}
        >
          <label>
            Activity Source
            <select
              style={inputStyle}
              value={form.source}
              onChange={(e) =>
                setForm({ ...form, source: e.target.value })
              }
            >
              <option value="Manual">Manual Entry</option>
              <option value="Google Fit">Google Fit (Manual Import)</option>
              <option value="Apple Health">
                Apple Health (Manual Import)
              </option>
            </select>
          </label>

          <label>
            Steps
            <input
              style={inputStyle}
              type="number"
              min="0"
              max="100000"
              required
              value={form.steps}
              onChange={(e) =>
                setForm({ ...form, steps: e.target.value })
              }
            />
          </label>

          <label>
            Duration (Minutes)
            <input
              style={inputStyle}
              type="number"
              min="0"
              max="1440"
              required
              value={form.duration_minutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  duration_minutes: e.target.value,
                })
              }
            />
          </label>

          <label>
            Activity Date
            <input
              style={inputStyle}
              type="date"
              required
              value={form.activity_date}
              onChange={(e) =>
                setForm({ ...form, activity_date: e.target.value })
              }
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Import Activity"}
          </button>
        </form>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p style={{ marginTop: "20px" }}>
        Google Fit and Apple Health automatic synchronization
        is not enabled. All activity data is entered manually.
      </p>
    </div>
  );
}
