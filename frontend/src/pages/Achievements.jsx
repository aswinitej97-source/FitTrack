
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Trophy,
  Medal,
  Award,
  Flame,
  Zap,
  Target,
  RefreshCw,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

const icons = {
  medal: Medal,
  trophy: Trophy,
  award: Award,
  flame: Flame,
  zap: Zap,
  target: Target,
};

export default function Achievements() {
  const [badges, setBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newBadges, setNewBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const auth = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const loadBadges = async () => {
    setLoading(true);
    setError("");

    try {
      const [allResponse, earnedResponse] = await Promise.all([
        axios.get(`${API}/badges/`, auth()),
        axios.get(`${API}/badges/my-badges`, auth()),
      ]);

      setBadges(allResponse.data);
      setEarnedBadges(earnedResponse.data);
    } catch (err) {
      setError("Unable to load achievements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  const checkAchievements = async () => {
    setChecking(true);
    setError("");
    setNewBadges([]);

    try {
      const response = await axios.post(
        `${API}/badges/check`,
        {},
        auth()
      );

      setNewBadges(response.data.new_badges || []);
      await loadBadges();
    } catch (err) {
      setError("Unable to check achievements.");
    } finally {
      setChecking(false);
    }
  };

  const earnedIds = new Set(
    earnedBadges.map((item) => item.badge_id)
  );

  const cardStyle = {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
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
      <h2>Achievement Badges</h2>
      <p>Earn rewards by completing fitness milestones.</p>

      <button
        onClick={checkAchievements}
        disabled={checking}
        style={{ marginBottom: "25px" }}
      >
        <RefreshCw size={16} />
        {" "}
        {checking ? "Checking..." : "Check Achievements"}
      </button>

      {error && <p role="alert">{error}</p>}

      {loading && <p>Loading badges...</p>}

      {!loading && (
        <>
          <div style={{ ...cardStyle, marginBottom: "25px" }}>
            <Trophy size={35} color="#eab308" />

            <h3>My Achievements</h3>

            <h2>
              {earnedBadges.length} / {badges.length}
            </h2>

            <p>Badges Unlocked</p>
          </div>

          {badges.length === 0 && (
            <p>
              No badges available yet. Select Check Achievements
              to initialize the badge library.
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {badges.map((badge) => {
              const Icon = icons[badge.icon] || Award;
              const unlocked = earnedIds.has(badge.id);

              return (
                <div
                  key={badge.id}
                  style={{
                    ...cardStyle,
                    opacity: unlocked ? 1 : 0.55,
                    border: unlocked
                      ? "2px solid #22c55e"
                      : "2px solid #e2e8f0",
                  }}
                >
                  <Icon
                    size={45}
                    color={unlocked ? "#eab308" : "#64748b"}
                  />

                  <h3>{badge.name}</h3>

                  <p>{badge.description}</p>

                  <strong>
                    {unlocked ? "Unlocked" : "Locked"}
                  </strong>
                </div>
              );
            })}
          </div>
        </>
      )}

      {newBadges.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="New achievements"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(90%, 400px)",
            }}
          >
            <Trophy size={55} color="#eab308" />

            <h2>Achievement Unlocked!</h2>

            {newBadges.map((name) => (
              <p key={name}>{name}</p>
            ))}

            <button onClick={() => setNewBadges([])}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
