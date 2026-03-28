import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Chatbot() {
  const [user, setUser] = useState(null);
  const [baseline, setBaseline] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [state, setState] = useState("🟢 Focused");

  // 🔐 Load user + baseline
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("email", data.user.email)
        .single();

      setBaseline(userData);

      // Load previous chats
      const { data: chats } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_email", data.user.email)
        .order("created_at", { ascending: true });

      setMessages(chats || []);
    };

    init();
  }, []);

  // 🧠 Cognitive State Logic
  useEffect(() => {
    if (!baseline) return;

    const interval = setInterval(() => {
      const speed = Math.random() * 80;
      const error = Math.random() * 20;

      if (speed < baseline.baseline_speed * 0.7) {
        setState("🔴 Fatigued");
      } else if (error > baseline.baseline_error * 1.5) {
        setState("🟡 Confused");
      } else {
        setState("🟢 Focused");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [baseline]);

  // 🎯 Prompt Generator
  const getPrompt = (text) => {
    if (state === "🔴 Fatigued") {
  return `Explain simply: ${text}`;
}
    if (state === "🟡 Confused") {
      return `Explain step-by-step with examples: ${text}`;
    }
    return `Give detailed explanation: ${text}`;
  };

  // 🤖 Send Message
  const sendMessage = async () => {
  if (!input.trim() || !user) return;

  const userMsg = {
    user_email: user.email,
    role: "user",
    message: input,
  };

  // Save user message
  await supabase.from("chat_messages").insert([userMsg]);
  setMessages((prev) => [...prev, userMsg]);

  const prompt = getPrompt(input);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
  },
  body: JSON.stringify({
    model: "openrouter/free", // 🔥 IMPORTANT (FREE MODEL)
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  }),
});

const data = await res.json();
console.log("OPENROUTER:", data);

let aiReply = "⚠️ No response";

if (data.choices?.length > 0) {
  aiReply = data.choices[0].message.content;
} else if (data.error) {
  aiReply = data.error.message;
}
    const aiMsg = {
      user_email: user.email,
      role: "assistant",
      message: aiReply,
    };

    // Save AI message
    await supabase.from("chat_messages").insert([aiMsg]);

    setMessages((prev) => [...prev, aiMsg]);
  } catch (err) {
    console.error("ERROR:", err);
  }

  setInput("");
};

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white shadow flex justify-between">
        <h1 className="font-bold text-lg">🤖 Smart Assistant</h1>
        <span>{state}</span>
      </div>

      {/* Chat */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <p
              className={`inline-block px-4 py-2 rounded-xl ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white shadow"
              }`}
            >
              {msg.message}
            </p>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white flex gap-3">
        <input
          className="flex-1 border rounded-xl p-3"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-6 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}