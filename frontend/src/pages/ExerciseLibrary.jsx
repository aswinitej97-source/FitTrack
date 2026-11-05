
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadExercises = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${API}/exercises/`, {
          params: {
            ...(search.trim() && { search: search.trim() }),
            ...(category && { category }),
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (active) {
          setExercises(response.data);
        }
      } catch (err) {
        if (active) {
          setError("Unable to load exercises.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadExercises();

    return () => {
      active = false;
    };
  }, [search, category]);

  const cardStyle = {
    background: "white",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };

  return (
    <div
      style={{
        padding: "25px",
        minHeight: "100vh",
        background: "#f1f5f9",
        color: "#1e293b",
      }}
    >
      <h2>Exercise Library</h2>
      <p>Explore exercises for your fitness routine.</p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <input
          type="search"
          placeholder="Search exercises..."
          value={search}
          maxLength={100}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            flex: 1,
            minWidth: "200px",
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
          }}
        >
          <option value="">All Categories</option>
          <option value="Cardio">Cardio</option>
          <option value="Strength">Strength</option>
          <option value="Yoga">Yoga</option>
        </select>
      </div>

      {loading && <p>Loading exercises...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && exercises.length === 0 && (
        <p>No exercises found. The library may be empty.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "18px",
        }}
      >
        {exercises.map((exercise) => (
          <div key={exercise.id} style={cardStyle}>
            <h3>{exercise.name}</h3>

            <p>
              <strong>Category:</strong> {exercise.category}
            </p>

            <p>
              {exercise.description || "No description available."}
            </p>

            <p>
              <strong>Duration:</strong> {exercise.duration} minutes
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
