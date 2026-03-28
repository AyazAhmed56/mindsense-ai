import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [baseline, setBaseline] = useState(null);
  const [currentState, setCurrentState] = useState("🟢 Focused");

  // Fake live metrics (later replace with real tracking)
  const [liveData, setLiveData] = useState({
    speed: 0,
    error: 0,
    pause: 0,
  });

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        navigate("/");
        return;
      }

      setUser(data.user);

      // Fetch baseline from your users table
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("email", data.user.email)
        .single();

      setBaseline(userData);
    };

    init();
  }, []);

  // 🧠 Cognitive State Logic
  useEffect(() => {
    if (!baseline) return;

    const interval = setInterval(() => {
      // simulate live tracking
      const speed = Math.floor(Math.random() * 80);
      const error = Math.floor(Math.random() * 20);

      setLiveData({ speed, error });

      if (speed < baseline.baseline_speed * 0.7) {
        setCurrentState("🔴 Fatigued");
      } else if (error > baseline.baseline_error * 1.5) {
        setCurrentState("🟡 Confused");
      } else {
        setCurrentState("🟢 Focused");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [baseline]);

  // 📊 Stats (Dynamic)
  const stats = [
    {
      label: "Focus Time",
      value: "2h 14m",
      icon: "🧠",
      change: "↑ Good",
    },
    {
      label: "Fatigue Events",
      value: "5",
      icon: "😴",
      change: "Today",
    },
    {
      label: "Confusion Events",
      value: "3",
      icon: "🤔",
      change: "Today",
    },
    {
      label: "Productivity Score",
      value: "82%",
      icon: "⚡",
      change: "↑ Improving",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-5">
        <h2 className="text-xl font-bold mb-6">MindSense 🧠</h2>

        <div className="space-y-3">
          <p className="font-semibold text-blue-600">Dashboard</p>
          <p className="text-gray-500 cursor-pointer">Calibration</p>
          <p className="text-gray-500 cursor-pointer">Analytics</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">
          Welcome {user?.email}
        </h1>

        {/* 🧠 Current State */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Current Cognitive State
          </h2>
          <p className="text-3xl">{currentState}</p>
        </div>

        {/* 📊 Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white p-5 rounded-xl shadow"
            >
              <p className="text-sm text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-blue-500">{s.change}</p>
            </div>
          ))}
        </div>

        {/* ⚡ Live Metrics */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-4">Live Tracking</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p>Typing Speed</p>
              <p className="text-xl font-bold">{liveData.speed} WPM</p>
            </div>

            <div>
              <p>Error Rate</p>
              <p className="text-xl font-bold">{liveData.error}</p>
            </div>

            <div>
              <p>Pause Time</p>
              <p className="text-xl font-bold">{liveData.pause}s</p>
            </div>
          </div>
        </div>

        {/* 🧪 Baseline */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Your Baseline</h2>

          {baseline ? (
            <div className="grid grid-cols-3 gap-4">
              <p>Speed: {baseline.baseline_speed}</p>
              <p>Error: {baseline.baseline_error}</p>
              <p>Pause: {baseline.baseline_pause}</p>
            </div>
          ) : (
            <p>No baseline found. Please calibrate.</p>
          )}
        </div>
      </main>
    </div>
  );
}