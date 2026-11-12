
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function WaterTracker() {
  const [quantity, setQuantity] = useState(250);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const loadData = async () => {
    try {
      const [summaryRes, historyRes] = await Promise.all([
        fetch(`${API}/water/daily-summary`, {
          headers: headers(),
        }),
        fetch(`${API}/water/`, {
          headers: headers(),
        }),
      ]);

      if (!summaryRes.ok || !historyRes.ok) {
        throw new Error("Failed to load water data");
      }

      setSummary(await summaryRes.json());
      setHistory(await historyRes.json());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addWater = async (amount) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/water/`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          quantity: Number(amount),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to add water intake");
      }

      setMessage(`${amount} ml water added successfully!`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteWater = async (id) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/water/${id}`, {
        method: "DELETE",
        headers: headers(),
      });

      if (!response.ok) {
        throw new Error("Unable to delete water entry");
      }

      setMessage("Water entry deleted successfully!");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const total = summary?.total_ml ?? 0;
  const goal = summary?.daily_goal_ml ?? 2000;
  const percentage = Math.min(100, (total / goal) * 100);

  return (
    <div style={{ padding: "25px", maxWidth: "900px", margin: "auto" }}>
      <h1>Water Intake Tracker</h1>
      <p>Stay hydrated and track your daily water consumption.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <div
        style={{
          padding: "25px",
          background: "#f1f5f9",
          borderRadius: "12px",
          marginBottom: "25px",
        }}
      >
        <h2>Today's Hydration</h2>
        <h1>{(total / 1000).toFixed(2)} L</h1>
        <p>Daily Goal: {(goal / 1000).toFixed(2)} L</p>

        <div
          style={{
            width: "100%",
            height: "24px",
            background: "#cbd5e1",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              background: "#0ea5e9",
              transition: "width 0.3s",
            }}
          />
        </div>

        <p>{percentage.toFixed(1)}% completed</p>
        <p>Remaining: {Math.max(0, goal - total)} ml</p>

        {total >= goal && (
          <p style={{ color: "green", fontWeight: "bold" }}>
            Daily water goal achieved!
          </p>
        )}
      </div>

      <h2>Add Water Intake</h2>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {[150, 250, 500].map((amount) => (
          <button key={amount} onClick={() => addWater(amount)}>
            + {amount} ml
          </button>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <input
          type="number"
          min="1"
          max="10000"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ padding: "10px", marginRight: "10px" }}
        />

        <button
          onClick={() => addWater(quantity)}
          disabled={
            !quantity ||
            Number(quantity) <= 0 ||
            Number(quantity) > 10000
          }
        >
          Add Custom Amount
        </button>
      </div>

      <h2>Water Intake History</h2>

      {history.length === 0 ? (
        <p>No water entries yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.quantity} ml</td>
                  <td>
                    <button onClick={() => deleteWater(entry.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
