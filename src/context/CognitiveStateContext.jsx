import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";

const CognitiveStateContext = createContext();

export const useCognitiveState = () => useContext(CognitiveStateContext);

export function CognitiveStateProvider({ children }) {
  const [baseline, setBaseline] = useState(null);
  const [currentState, setCurrentState] = useState("Focused");
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentError, setCurrentError] = useState(0);
  const [currentPause, setCurrentPause] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [timeStarted, setTimeStarted] = useState(null);
  const [lastKeyTime, setLastKeyTime] = useState(null);
  const [userId, setUserId] = useState(null);

  const lastSavedState = useRef("");

  useEffect(() => {
    loadUserBaseline();
  }, []);

  useEffect(() => {
    if (!baseline || !typedText || !timeStarted) return;

    const now = Date.now();
    const speed = calculateWPM(typedText, timeStarted, now);
    const errors = estimateErrors(typedText);
    const errorRate =
      typedText.length > 0 ? Math.round((errors / typedText.length) * 100) : 0;

    setCurrentSpeed(speed);
    setCurrentError(errorRate);

    const detected = detectState(
      speed,
      errorRate,
      currentPause,
      baseline.baseline_speed,
      baseline.baseline_error,
      baseline.baseline_pause || 0
    );

    setCurrentState(detected);
  }, [typedText, baseline, currentPause, timeStarted]);

  useEffect(() => {
    if (!userId) return;
    if (currentState === lastSavedState.current) return;

    saveStateLog(currentState);
    lastSavedState.current = currentState;
  }, [currentState, userId]);

  const loadUserBaseline = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const { data, error } = await supabase
      .from("users")
      .select("baseline_speed, baseline_error, baseline_pause")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setBaseline(data);
    }
  };

  const trackTyping = (value) => {
    const now = Date.now();

    if (!timeStarted && value.length > 0) {
      setTimeStarted(now);
    }

    if (lastKeyTime) {
      const gap = now - lastKeyTime;
      if (gap > 2000) {
        setCurrentPause((prev) => prev + 1);
      }
    }

    setLastKeyTime(now);
    setTypedText(value);
  };

  const calculateWPM = (typedText, startTime, endTime) => {
    const minutes = (endTime - startTime) / 1000 / 60;
    const wordsTyped = typedText.trim().split(/\s+/).filter(Boolean).length;

    if (minutes <= 0) return 0;
    return Math.round(wordsTyped / minutes);
  };

  const estimateErrors = (text) => {
    // simple hackathon estimate:
    // count repeated spaces + weird punctuation bursts + rough typo signal
    let errors = 0;

    for (let i = 1; i < text.length; i++) {
      if (text[i] === " " && text[i - 1] === " ") errors++;
    }

    return errors;
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

    if (errorRate > Math.max(5, baselineError * 1.5)) {
      return "Confused";
    }

    return "Focused";
  };

  const saveStateLog = async (state) => {
    await supabase.from("fatigue_logs").insert({
      user_id: userId,
      is_fatigued: state === "Fatigued",
      state,
      current_speed: currentSpeed,
      current_error: currentError,
      current_pause: currentPause,
    });
  };

  const getResponseMode = () => {
    if (currentState === "Focused") {
      return {
        answerStyle: "detailed",
        uiMode: "advanced",
      };
    }

    if (currentState === "Confused") {
      return {
        answerStyle: "step-by-step",
        uiMode: "guided",
      };
    }

    return {
      answerStyle: "short-simple",
      uiMode: "low-load",
    };
  };

  return (
    <CognitiveStateContext.Provider
      value={{
        baseline,
        currentState,
        currentSpeed,
        currentError,
        currentPause,
        trackTyping,
        responseMode: getResponseMode(),
      }}
    >
      {children}
    </CognitiveStateContext.Provider>
  );
}