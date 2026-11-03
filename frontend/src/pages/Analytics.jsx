
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const API = "http://127.0.0.1:8000";

export default function Analytics() {
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [calories, setCalories] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };

    async function loadAnalytics() {
      try {
        const [weekRes, monthRes, calorieRes] = await Promise.all([
          axios.get(`${API}/analytics/weekly`, config),
          axios.get(`${API}/analytics/monthly`, config),
          axios.get(`${API}/analytics/calories`, config),
        ]);

        setWeekly(weekRes.data);
        setMonthly(monthRes.data);
        setCalories(calorieRes.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load analytics.");
      }
    }

    loadAnalytics();
  }, []);

  const chartData = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.daily)) return data.daily;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const weeklyData = chartData(weekly);
  const monthlyData = chartData(monthly);
  const calorieData = chartData(calories);

  return (
    <div style={{ padding: "25px" }}>
      <h1>Fitness Analytics</h1>
      <p>Track your workout and calorie progress.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Weekly Workout Analytics</h2>
      {weeklyData.length > 0 ? (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="duration" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <pre>{JSON.stringify(weekly, null, 2)}</pre>
      )}

      <h2>Monthly Workout Analytics</h2>
      {monthlyData.length > 0 ? (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="duration"
                stroke="#16a34a"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <pre>{JSON.stringify(monthly, null, 2)}</pre>
      )}

      <h2>Calories Burned</h2>
      {calorieData.length > 0 ? (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="calories_burned" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <pre>{JSON.stringify(calories, null, 2)}</pre>
      )}
    </div>
  );
}
