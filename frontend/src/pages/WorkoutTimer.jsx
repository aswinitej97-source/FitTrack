
import { useEffect, useRef, useState } from "react";

const API = "http://127.0.0.1:8000";

const CALORIE_RATES = {
  cardio: 8,
  strength: 5,
  yoga: 3,
  walking: 4,
  running: 10,
};

export default function WorkoutTimer() {
  const [workoutName, setWorkoutName] = useState("Morning Workout");
  const [category, setCategory] = useState("Cardio");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );

      setSeconds(elapsedRef.current + elapsed);
    }, 250);

    return () => clearInterval(interval);
  }, [running]);

  const startTimer = () => {
    setMessage("");
    setError("");
    startTimeRef.current = Date.now();
    setRunning(true);
  };

  const stopTimer = () => {
    if (startTimeRef.current !== null) {
      const elapsed = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );

      const total = elapsedRef.current + elapsed;
      elapsedRef.current = total;
      setSeconds(total);
    }

    startTimeRef.current = null;
    setRunning(false);
  };

  const resetTimer = () => {
    setRunning(false);
    setSeconds(0);
    elapsedRef.current = 0;
    startTimeRef.current = null;
    setMessage("");
    setError("");
  };

  const saveWorkout = async () => {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${API}/workout-timer/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workout_name: workoutName,
          category,
          duration_seconds: seconds,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save workout");
      }

      const result = await response.json();

      setMessage(
        `Workout saved! Estimated calories burned: ${result.estimated_calories_burned} kcal`
      );

      setSeconds(0);
      elapsedRef.current = 0;
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return [hours, minutes, secs]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const estimatedCalories =
    (seconds / 60) * (CALORIE_RATES[category.toLowerCase()] || 5);

  return (
    <div style={{ padding: "25px", maxWidth: "800px", margin: "auto" }}>
      <h1>Workout Timer & Live Tracking</h1>
      <p>Track workout duration and estimated calories in real time.</p>

      <div
        style={{
          background: "#f1f5f9",
          padding: "30px",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <input
          type="text"
          value={workoutName}
          maxLength={100}
          onChange={(e) => setWorkoutName(e.target.value)}
          disabled={running}
          placeholder="Workout Name"
          style={{ padding: "10px", margin: "10px" }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={running}
          style={{ padding: "10px", margin: "10px" }}
        >
          <option>Cardio</option>
          <option>Strength</option>
          <option>Yoga</option>
          <option>Walking</option>
          <option>Running</option>
        </select>

        <h1 style={{ fontSize: "55px", margin: "25px 0" }}>
          {formatTime(seconds)}
        </h1>

        <h2>{estimatedCalories.toFixed(2)} kcal</h2>
        <p>Estimated Calories Burned</p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {!running ? (
            <button onClick={startTimer} disabled={saving}>
              Start
            </button>
          ) : (
            <button onClick={stopTimer}>Stop / Pause</button>
          )}

          <button onClick={resetTimer} disabled={saving}>
            Reset
          </button>

          <button
            onClick={saveWorkout}
            disabled={
              running ||
              saving ||
              seconds <= 0 ||
              seconds > 86400 ||
              !workoutName.trim()
            }
          >
            {saving ? "Saving..." : "Complete & Save"}
          </button>
        </div>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p style={{ marginTop: "20px" }}>
        Note: Calorie values are estimates based on workout category
        and duration, not measured energy expenditure.
      </p>
    </div>
  );
}
