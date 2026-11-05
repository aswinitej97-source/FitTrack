
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function WorkoutPlanner() {
  const [plans, setPlans] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  const auth = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const loadPlans = async () => {
    try {
      const response = await axios.get(
        `${API}/workout-plans/`,
        auth()
      );
      setPlans(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        "Unable to load workout plans"
      );
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const createPlan = async (event) => {
    event.preventDefault();
    setMessage("");

    if (scheduledDate < today) {
      setMessage("Please select today or a future date.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API}/workout-plans/`,
        {
          title,
          description,
          scheduled_date: scheduledDate,
        },
        auth()
      );

      setMessage("Workout scheduled successfully!");
      setTitle("");
      setDescription("");
      setScheduledDate("");
      await loadPlans();
    } catch (error) {
      setMessage(
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : "Unable to schedule workout"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = selectedDate
    ? plans.filter(
        (plan) => plan.scheduled_date === selectedDate
      )
    : plans;

  const upcoming = plans.filter(
    (plan) => plan.scheduled_date >= today
  );

  const cardStyle = {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  };

  const inputStyle = {
    width: "100%",
    padding: "11px",
    marginBottom: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    boxSizing: "border-box",
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
      <h2>Workout Plans & Scheduling</h2>
      <p>Plan your workouts and stay consistent.</p>

      <div style={cardStyle}>
        <h3>Schedule New Workout</h3>

        <form onSubmit={createPlan}>
          <input
            style={inputStyle}
            placeholder="Workout title"
            value={title}
            maxLength={150}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            style={inputStyle}
            placeholder="Workout description"
            value={description}
            maxLength={500}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <input
            type="date"
            style={inputStyle}
            min={today}
            value={scheduledDate}
            onChange={(e) =>
              setScheduledDate(e.target.value)
            }
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Scheduling..." : "Schedule Workout"}
          </button>
        </form>

        {message && <p role="status">{message}</p>}
      </div>

      <div style={cardStyle}>
        <h3>Workout Calendar</h3>

        <input
          type="date"
          style={inputStyle}
          value={selectedDate}
          onChange={(e) =>
            setSelectedDate(e.target.value)
          }
        />

        <button
          type="button"
          onClick={() => setSelectedDate("")}
        >
          Show All Dates
        </button>
      </div>

      <div style={cardStyle}>
        <h3>Scheduled Workouts</h3>

        {filteredPlans.length === 0 ? (
          <p>No workouts found.</p>
        ) : (
          filteredPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                padding: "12px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <strong>{plan.title}</strong>
              <p>{plan.description}</p>
              <small>{plan.scheduled_date}</small>
            </div>
          ))
        )}
      </div>

      <div style={cardStyle}>
        <h3>Upcoming Workouts</h3>

        {upcoming.length === 0 ? (
          <p>No upcoming workouts.</p>
        ) : (
          upcoming.map((plan) => (
            <p key={plan.id}>
              {plan.scheduled_date} - {plan.title}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
