
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({
    workout_type: "",
    duration: "",
    calories_burned: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const config = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const loadWorkouts = async () => {
    try {
      const response = await axios.get(`${API}/workouts/`, config());
      setWorkouts(response.data);
    } catch {
      setError("Failed to load workouts.");
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      workout_type: form.workout_type,
      duration: Number(form.duration),
      calories_burned: Number(form.calories_burned),
      date: form.date,
    };

    try {
      if (editingId !== null) {
        await axios.put(
          `${API}/workouts/${editingId}`,
          payload,
          config()
        );
      } else {
        await axios.post(`${API}/workouts/`, payload, config());
      }

      setEditingId(null);
      setForm({
        workout_type: "",
        duration: "",
        calories_burned: "",
        date: new Date().toISOString().slice(0, 10),
      });
      await loadWorkouts();
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Failed to save workout."
      );
    }
  };

  const handleEdit = (workout) => {
    setEditingId(workout.id);
    setForm({
      workout_type: workout.workout_type,
      duration: String(workout.duration),
      calories_burned: String(workout.calories_burned),
      date: workout.date,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workout?")) return;

    try {
      await axios.delete(`${API}/workouts/${id}`, config());
      await loadWorkouts();
    } catch {
      setError("Failed to delete workout.");
    }
  };

  return (
    <div style={{ padding: "25px" }}>
      <h1>Workout Management</h1>

      <h2>{editingId !== null ? "Edit Workout" : "Add Workout"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Workout Type (Running, Yoga...)"
          value={form.workout_type}
          onChange={(e) =>
            setForm({ ...form, workout_type: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Duration (minutes)"
          min="1"
          value={form.duration}
          onChange={(e) =>
            setForm({ ...form, duration: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Calories Burned"
          min="0"
          value={form.calories_burned}
          onChange={(e) =>
            setForm({ ...form, calories_burned: e.target.value })
          }
          required
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          required
        />

        <button type="submit">
          {editingId !== null ? "Update Workout" : "Add Workout"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                workout_type: "",
                duration: "",
                calories_burned: "",
                date: new Date().toISOString().slice(0, 10),
              });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>My Workouts</h2>

      {workouts.length === 0 ? (
        <p>No workouts added yet.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Type</th>
              <th>Duration</th>
              <th>Calories</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((workout) => (
              <tr key={workout.id}>
                <td>{workout.workout_type}</td>
                <td>{workout.duration} min</td>
                <td>{workout.calories_burned}</td>
                <td>{workout.date}</td>
                <td>
                  <button onClick={() => handleEdit(workout)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(workout.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
