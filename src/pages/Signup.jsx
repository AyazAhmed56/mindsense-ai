import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Insert into users table
    await supabase.from("users").insert([
      {
        id: data.user.id,
        email: data.user.email,
      },
    ]);

    alert("Signup successful!");
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-col justify-between flex-1 relative overflow-hidden bg-linear-to-br from-sky-600 via-sky-500 to-sky-400 p-12">
        {/* Background orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/[0.07]" />
        <div className="absolute -bottom-24 -right-16 w-105 h-105 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/4" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center text-white text-xl">
            ⬡
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            SkyBase
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Start building
            <br />
            for free.
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-xs mb-10">
            Join thousands of teams who use SkyBase to ship faster, collaborate
            better, and stay on top of everything.
          </p>

          {/* Steps */}
          <div className="flex flex-col gap-4">
            {[
              { step: "01", text: "Create your free account" },
              { step: "02", text: "Set up your first project" },
              { step: "03", text: "Invite your team & launch" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white text-[11px] font-bold shrink-0 font-mono">
                  {s.step}
                </div>
                <span className="text-white/80 text-sm font-medium">
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/40 text-xs">
          © 2025 SkyBase. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col justify-center items-center w-full lg:w-125 px-8 py-16 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-lg shadow-md shadow-sky-200">
              ⬡
            </div>
            <span className="text-lg font-extrabold text-slate-800">
              SkyBase
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[1.4px] text-sky-500 mb-2">
              Get started
            </p>
            <h1 className="text-[28px] font-extrabold text-slate-800 tracking-tight leading-tight mb-2">
              Create your account
            </h1>
            <p className="text-sm text-slate-400">
              Free forever. No credit card required.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-sky-50/50 text-slate-800 text-sm placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all duration-150"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-sky-50/50 text-slate-800 text-sm placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors text-sm"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Terms note */}
            <p className="text-[11px] text-slate-400 leading-relaxed">
              By signing up, you agree to our{" "}
              <span className="text-sky-500 font-semibold cursor-pointer hover:text-sky-600">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-sky-500 font-semibold cursor-pointer hover:text-sky-600">
                Privacy Policy
              </span>
              .
            </p>

            {/* Submit */}
            <button
              onClick={handleSignup}
              disabled={loading}
              className="mt-1 w-full py-3 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create Account →"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-sky-500 font-bold cursor-pointer hover:text-sky-600 transition-colors"
            >
              Sign in →
            </span>
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-10">
            {["🔒 Secure signup", "⚡ Instant access", "🆓 Always free"].map(
              (b) => (
                <span
                  key={b}
                  className="text-[11px] text-slate-400 font-medium"
                >
                  {b}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
