import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";

const sampleText = `Technology should adapt to the user's behavior in real time.
Typing speed, typing mistakes, and pauses can indicate mental state.
A focused user usually types steadily with fewer mistakes and fewer pauses.
This live test compares current behavior with the saved baseline.`;

export default function BehaviorTracking() {
  const [baseline, setBaseline] = useState(null);
  const [userId, setUserId] = useState(null);

  const [input, setInput] = useState("");
  const [timeStarted, setTimeStarted] = useState(null);
  const [lastKeyTime, setLastKeyTime] = useState(null);
  const [pauseCount, setPauseCount] = useState(0);

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentError, setCurrentError] = useState(0);
  const [state, setState] = useState("Focused");
  const [saving, setSaving] = useState(false);

  const lastSavedState = useRef("");

  useEffect(() => {
    fetchBaseline();
  }, []);

  useEffect(() => {
    if (!baseline || !timeStarted) return;

    const interval = setInterval(() => {
      const now = Date.now();

      const speed = calculateWPM(input, timeStarted, now);
      const totalErrors = calculateErrors(input, sampleText);
      const errorRate =
        input.length > 0 ? Math.round((totalErrors / input.length) * 100) : 0;

      setCurrentSpeed(speed);
      setCurrentError(errorRate);

      const detectedState = detectState(
        speed,
        errorRate,
        pauseCount,
        baseline.baseline_speed,
        baseline.baseline_error,
        baseline.baseline_pause || 0
      );

      setState(detectedState);
    }, 1000);

    return () => clearInterval(interval);
  }, [input, baseline, timeStarted, pauseCount]);

  useEffect(() => {
    if (!userId) return;
    if (!state) return;
    if (state === lastSavedState.current) return;

    saveStateLog(state, currentSpeed, currentError, pauseCount);
    lastSavedState.current = state;
  }, [state]);

  const fetchBaseline = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("users")
      .select("baseline_speed, baseline_error, baseline_pause")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log(error);
      alert("Could not load baseline data");
      return;
    }

    setBaseline(data);
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    const now = Date.now();

    if (!timeStarted && value.length === 1) {
      setTimeStarted(now);
    }

    if (lastKeyTime) {
      const gap = now - lastKeyTime;

      if (gap > 2000) {
        setPauseCount((prev) => prev + 1);
      }
    }

    setLastKeyTime(now);
    setInput(value);
  };

  const calculateErrors = (typed, original) => {
    let errors = 0;
    const maxLength = Math.max(typed.length, original.length);

    for (let i = 0; i < maxLength; i++) {
      if (typed[i] !== original[i]) {
        errors++;
      }
    }

    return errors;
  };

  const calculateWPM = (typedText, startTime, endTime) => {
    const minutes = (endTime - startTime) / 1000 / 60;
    const wordsTyped = typedText.trim().split(/\s+/).filter(Boolean).length;

    if (minutes <= 0) return 0;
    return Math.round(wordsTyped / minutes);
  };

  const detectState = (
    speed,
    errorRate,
    pauses,
    baselineSpeed,
    baselineError,
    baselinePause
  ) => {
    if (speed < baselineSpeed * 0.7 || pauses > baselinePause + 2) {
      return "Fatigued";
    }

    if (errorRate > baselineError * 1.5) {
      return "Confused";
    }

    return "Focused";
  };

  const saveStateLog = async (detectedState, speed, errorRate, pauses) => {
    if (!userId) return;

    setSaving(true);

    const { error } = await supabase.from("fatigue_logs").insert({
      user_id: userId,
      is_fatigued: detectedState === "Fatigued",
      state: detectedState,
      current_speed: speed,
      current_error: errorRate,
      current_pause: pauses,
    });

    setSaving(false);

    if (error) {
      console.log("Fatigue log error:", error.message);
    }
  };

  const stateColor =
    state === "Focused"
      ? "bg-green-100 border-green-300 text-green-700"
      : state === "Confused"
      ? "bg-yellow-100 border-yellow-300 text-yellow-700"
      : "bg-red-100 border-red-300 text-red-700";

  if (!baseline) {
    return <h1 className="text-center mt-10">Loading baseline...</h1>;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Real-Time Behavior Tracking
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Start typing the text below. The system will compare your current
          behavior with your baseline.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3">Text to Type</h2>
            <p className="text-gray-800 leading-7 whitespace-pre-line">
              {sampleText}
            </p>
          </div>

          <div className={`border rounded-xl p-5 ${stateColor}`}>
            <h2 className="text-lg font-semibold mb-3">Detected State</h2>
            <p className="text-3xl font-bold">{state}</p>

            <p className="mt-3 text-sm">
              {state === "Focused" &&
                "The user is typing close to normal baseline values."}
              {state === "Confused" &&
                "The user is making more typing mistakes than usual."}
              {state === "Fatigued" &&
                "The user is slower than usual or pausing more often."}
            </p>
          </div>
        </div>

        <textarea
          value={input}
          onChange={handleTyping}
          placeholder="Type here..."
          className="w-full min-h-[220px] border border-gray-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-sm text-gray-500">Current Speed</p>
            <p className="text-2xl font-bold">{currentSpeed} WPM</p>
            <p className="text-sm text-gray-400 mt-1">
              Baseline: {baseline.baseline_speed} WPM
            </p>
          </div>

          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-sm text-gray-500">Current Error Rate</p>
            <p className="text-2xl font-bold">{currentError}%</p>
            <p className="text-sm text-gray-400 mt-1">
              Baseline: {baseline.baseline_error}%
            </p>
          </div>

          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-sm text-gray-500">Current Pause Count</p>
            <p className="text-2xl font-bold">{pauseCount}</p>
            <p className="text-sm text-gray-400 mt-1">
              Baseline: {baseline.baseline_pause || 0}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          {saving ? "Saving state log..." : "Tracking is active"}
        </div>
      </div>
    </div>
  );
}