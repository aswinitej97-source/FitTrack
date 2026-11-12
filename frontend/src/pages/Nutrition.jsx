
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function Nutrition() {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    meal_type: "Breakfast",
    food_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const loadData = async () => {
    try {
      const [mealsRes, summaryRes] = await Promise.all([
        fetch(`${API}/meals/`, { headers: headers() }),
        fetch(`${API}/meals/daily-summary`, {
          headers: headers(),
        }),
      ]);

      if (!mealsRes.ok || !summaryRes.ok) {
        throw new Error("Failed to load nutrition data");
      }

      setMeals(await mealsRes.json());
      setSummary(await summaryRes.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addMeal = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        meal_type: form.meal_type,
        food_name: form.food_name,
        calories: Number(form.calories),
        protein: Number(form.protein || 0),
        carbs: Number(form.carbs || 0),
        fats: Number(form.fats || 0),
      };

      const response = await fetch(`${API}/meals/`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to add meal");
      }

      setMessage("Meal added successfully!");

      setForm({
        meal_type: "Breakfast",
        food_name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMeal = async (id) => {
    try {
      const response = await fetch(`${API}/meals/${id}`, {
        method: "DELETE",
        headers: headers(),
      });

      if (!response.ok) {
        throw new Error("Unable to delete meal");
      }

      setMessage("Meal deleted successfully!");
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
    <div style={{ padding: "25px", maxWidth: "1100px", margin: "auto" }}>
      <h1>Nutrition & Meal Tracking</h1>
      <p>Track your daily meals, calories and nutrients.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <h2>Daily Nutrition Summary</h2>

      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        {[
          ["Calories", summary?.total_calories ?? 0, "kcal"],
          ["Protein", summary?.total_protein ?? 0, "g"],
          ["Carbs", summary?.total_carbs ?? 0, "g"],
          ["Fats", summary?.total_fats ?? 0, "g"],
        ].map(([label, value, unit]) => (
          <div
            key={label}
            style={{
              padding: "20px",
              background: "#f1f5f9",
              borderRadius: "10px",
              minWidth: "160px",
            }}
          >
            <h3>{label}</h3>
            <h2>{value} {unit}</h2>
          </div>
        ))}
      </div>

      <h2>Add Meal</h2>

      <form
        onSubmit={addMeal}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "25px",
        }}
      >
        <select
          style={inputStyle}
          value={form.meal_type}
          onChange={(e) =>
            setForm({ ...form, meal_type: e.target.value })
          }
        >
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snacks</option>
        </select>

        <input
          style={inputStyle}
          placeholder="Food Name"
          required
          value={form.food_name}
          onChange={(e) =>
            setForm({ ...form, food_name: e.target.value })
          }
        />

        {["calories", "protein", "carbs", "fats"].map((field) => (
          <input
            key={field}
            style={inputStyle}
            type="number"
            min="0"
            step="0.1"
            required={field === "calories"}
            placeholder={field.toUpperCase()}
            value={form[field]}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })
            }
          />
        ))}

        <button type="submit">Add Meal</button>
      </form>

      <h2>Meal History</h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              {[
                "Meal Type",
                "Food",
                "Calories",
                "Protein",
                "Carbs",
                "Fats",
                "Action",
              ].map((heading) => (
                <th key={heading} style={{ padding: "12px" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {meals.map((meal) => (
              <tr key={meal.id}>
                <td>{meal.meal_type}</td>
                <td>{meal.food_name}</td>
                <td>{meal.calories}</td>
                <td>{meal.protein}</td>
                <td>{meal.carbs}</td>
                <td>{meal.fats}</td>
                <td>
                  <button onClick={() => deleteMeal(meal.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meals.length === 0 && <p>No meals added yet.</p>}
      </div>
    </div>
  );
}
