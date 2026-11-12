
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({
    reminder_type: "Workout",
    title: "",
    reminder_time: "08:00",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const loadData = async () => {
    try {
      const [remindersRes, alertsRes] = await Promise.all([
        fetch(`${API}/reminders/`, { headers: headers() }),
        fetch(`${API}/reminders/alerts`, { headers: headers() }),
      ]);

      if (!remindersRes.ok || !alertsRes.ok) {
        throw new Error("Failed to load reminders");
      }

      setReminders(await remindersRes.json());
      setAlerts(await alertsRes.json());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addReminder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/reminders/`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Unable to create reminder");
      }

      setMessage("Reminder created successfully!");

      setForm({
        reminder_type: "Workout",
        title: "",
        reminder_time: "08:00",
        is_active: true,
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = async (reminder) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/reminders/${reminder.id}`,
        {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({
            reminder_type: reminder.reminder_type,
            title: reminder.title,
            reminder_time: reminder.reminder_time,
            is_active: !reminder.is_active,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update reminder");
      }

      setMessage("Reminder updated successfully!");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteReminder = async (id) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/reminders/${id}`, {
        method: "DELETE",
        headers: headers(),
      });

      if (!response.ok) {
        throw new Error("Unable to delete reminder");
      }

      setMessage("Reminder deleted successfully!");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = {
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
  };

  return (
    <div style={{ padding: "25px", maxWidth: "950px", margin: "auto" }}>
      <h1>Reminders & Notifications</h1>
      <p>Manage your workout, meal and water reminders.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {Array.isArray(alerts) && alerts.length > 0 && (
        <div
          style={{
            padding: "15px",
            background: "#fef3c7",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h2>Active Alerts</h2>
          {alerts.map((alert, index) => (
            <p key={alert.id ?? index}>
              {alert.title ?? alert.message ?? "Reminder due"}
            </p>
          ))}
        </div>
      )}

      <h2>Create Reminder</h2>

      <form
        onSubmit={addReminder}
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "500px",
          marginBottom: "30px",
        }}
      >
        <select
          style={inputStyle}
          value={form.reminder_type}
          onChange={(e) =>
            setForm({ ...form, reminder_type: e.target.value })
          }
        >
          <option value="Workout">Workout</option>
          <option value="Meal">Meal</option>
          <option value="Water">Water</option>
        </select>

        <input
          style={inputStyle}
          type="text"
          placeholder="Reminder Title"
          required
          maxLength={100}
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          style={inputStyle}
          type="time"
          required
          value={form.reminder_time}
          onChange={(e) =>
            setForm({ ...form, reminder_time: e.target.value })
          }
        />

        <label>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm({ ...form, is_active: e.target.checked })
            }
          />
          Active Reminder
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Reminder"}
        </button>
      </form>

      <h2>My Reminders</h2>

      {reminders.length === 0 ? (
        <p>No reminders created yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr key={reminder.id}>
                  <td>{reminder.reminder_type}</td>
                  <td>{reminder.title}</td>
                  <td>{reminder.reminder_time}</td>
                  <td>
                    {reminder.is_active ? "Active" : "Inactive"}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleReminder(reminder)}
                    >
                      {reminder.is_active ? "Disable" : "Enable"}
                    </button>{" "}
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                    >
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
