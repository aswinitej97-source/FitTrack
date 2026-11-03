
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [goalType, setGoalType] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [error, setError] = useState("");

  const config = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const loadGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals/`, config());
      setGoals(response.data);
    } catch {
      setError("Failed to load goals.");
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const addGoal = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        `${API}/goals/`,
        {
          goal_type: goalType,
          target_value: Number(targetValue),
        },
        config()
      );

      setGoalType("");
      setTargetValue("");
      await loadGoals();
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Failed to add goal."
      );
    }
  };

  const updateProgress = async (goal) => {
    const value = window.prompt(
      "Enter current progress:",
      String(goal.current_value ?? 0)
    );

    if (value === null) return;

    const progress = Number(value);

    if (!Number.isFinite(progress) || value.trim() === "" || progress < 0) {
      alert("Enter a valid progress value.");
      return;
    }

    try {
      await axios.put(
        `${API}/goals/${goal.id}/progress`,
        { current_value: progress },
        config()
      );
      await loadGoals();
    } catch {
      setError("Failed to update progress.");
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Delete this goal?")) return;

    try {
      await axios.delete(`${API}/goals/${id}`, config());
      await loadGoals();
    } catch {
      setError("Failed to delete goal.");
    }
  };

  return (
    <div style={{ padding: "25px" }}>
      <h1>Fitness Goals</h1>

      <h2>Create New Goal</h2>

      <form onSubmit={addGoal}>
        <input
          type="text"
          placeholder="Goal Type (Weight Loss, Running...)"
          value={goalType}
          onChange={(e) => setGoalType(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Target Value"
          min="0.1"
          step="any"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          required
        />

        <button type="submit">Add Goal</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>My Goals</h2>

      {goals.length === 0 ? (
        <p>No goals created yet.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Goal</th>
              <th>Target</th>
              <th>Current</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {goals.map((goal) => {
              const current = Number(goal.current_value ?? 0);
              const target = Number(goal.target_value);
              const percentage =
                target > 0
                  ? Math.min(100, (current / target) * 100)
                  : 0;

              return (
                <tr key={goal.id}>
                  <td>{goal.goal_type}</td>
                  <td>{goal.target_value}</td>
                  <td>{current}</td>
                  <td>
                    <progress value={percentage} max="100" />
                    {" "}{percentage.toFixed(1)}%
                  </td>
                  <td>
                    <button onClick={() => updateProgress(goal)}>
                      Update Progress
                    </button>
                    <button onClick={() => deleteGoal(goal.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
