import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

const sampleText = `The future of technology depends on how people interact with intelligent systems.
A good digital product should understand user behavior and respond in a simple way.
Typing speed, errors, and pauses can help us estimate focus and mental fatigue.
This baseline test helps the system learn the user's normal typing pattern.`;

export default function BaselineTest() {
  const [input, setInput] = useState("");
  const [timeStarted, setTimeStarted] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [lastKeyTime, setLastKeyTime] = useState(null);
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

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

  const detectState = (speed, errorRate, pauses) => {
    if (speed < 20 || pauses > 3) {
      return "Fatigued";
    }

    if (errorRate > 15) {
      return "Confused";
    }

    return "Focused";
  };

  const handleSubmit = async () => {
    if (!timeStarted) {
      alert("Start typing first.");
      return;
    }

    const end = Date.now();
    setIsFinished(true);
    setLoading(true);

    const totalErrors = calculateErrors(input, sampleText);
    const wpm = calculateWPM(input, timeStarted, end);
    const errorRate =
      input.length > 0 ? Math.round((totalErrors / input.length) * 100) : 0;

    const detectedState = detectState(wpm, errorRate, pauseCount);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      setLoading(false);
      return;
    }

    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        baseline_speed: wpm,
        baseline_error: errorRate,
        baseline_pause: pauseCount,
      })
      .eq("id", user.id);

    if (userUpdateError) {
      console.log(userUpdateError);
      alert(userUpdateError.message);
      setLoading(false);
      return;
    }

    const { error: fatigueLogError } = await supabase
      .from("fatigue_logs")
      .insert({
        user_id: user.id,
        is_fatigued: detectedState === "Fatigued",
        state: detectedState,
        current_speed: wpm,
        current_error: errorRate,
        current_pause: pauseCount,
      });

    setLoading(false);

    if (fatigueLogError) {
      console.log(fatigueLogError);
      alert(fatigueLogError.message);
      return;
    }

    alert("Baseline and hidden state saved successfully");
    navigate("/dashboard")
  };

  const totalErrors = calculateErrors(input, sampleText);
  const liveWpm =
    timeStarted && input.length > 0
      ? calculateWPM(input, timeStarted, Date.now())
      : 0;

  const liveErrorRate =
    input.length > 0 ? Math.round((totalErrors / input.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Baseline Typing Test
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Read the text below and type it carefully. This helps the system learn
          your normal typing behavior.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-lg mb-3">Text to Type</h2>
          <p className="text-gray-800 leading-7 whitespace-pre-line">
            {sampleText}
          </p>
        </div>

        <textarea
          value={input}
          onChange={handleTyping}
          placeholder="Start typing the text here..."
          className="w-full min-h-[220px] border border-gray-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isFinished}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4 border">
            <p className="text-sm text-gray-500">Typing Speed</p>
            <p className="text-2xl font-bold">{liveWpm} WPM</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border">
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-2xl font-bold">{liveErrorRate}%</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border">
            <p className="text-sm text-gray-500">Pause Count</p>
            <p className="text-2xl font-bold">{pauseCount}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || isFinished}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? "Saving..." : "Finish & Save Baseline"}
          </button>
        </div>
      </div>
    </div>
  );
}