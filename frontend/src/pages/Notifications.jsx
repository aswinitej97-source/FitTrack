
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const config = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const loadNotifications = async () => {
    try {
      const response = await axios.get(
        `${API}/notifications/`,
        config()
      );
      setNotifications(response.data);
    } catch {
      setError("Failed to load notifications.");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const createReminder = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post(
        `${API}/notifications/reminder`,
        {},
        config()
      );
      setMessage("Workout reminder requested.");
      await loadNotifications();
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Failed to create reminder."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkGoalAlerts = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post(
        `${API}/notifications/goal-alerts`,
        {},
        config()
      );
      setMessage("Goal alerts checked.");
      await loadNotifications();
    } catch {
      setError("Failed to check goal alerts.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setError("");

    try {
      await axios.put(
        `${API}/notifications/${id}/read`,
        {},
        config()
      );
      await loadNotifications();
    } catch {
      setError("Failed to mark notification as read.");
    }
  };

  return (
    <div style={{ padding: "25px" }}>
      <h1>FitTrack Notifications</h1>
      <p>Manage workout reminders and fitness goal alerts.</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={createReminder} disabled={loading}>
          Create Workout Reminder
        </button>

        <button onClick={checkGoalAlerts} disabled={loading}>
          Check Goal Alerts
        </button>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>My Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              style={{
                padding: "12px",
                marginBottom: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>
                {notification.title || "Notification"}
              </strong>

              <p>{notification.message}</p>

              <small>
                {notification.is_read ? "Read" : "Unread"}
              </small>

              {!notification.is_read && (
                <button
                  style={{ marginLeft: "12px" }}
                  onClick={() => markAsRead(notification.id)}
                >
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
