import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/");
      } else {
        setUser(data.user);
      }
    };
    checkUser();
  }, []);

  const stats = [
    { label: "Total Projects", value: "24", icon: "◈", change: "+3 this week" },
    { label: "Active Tasks", value: "138", icon: "◎", change: "+12 today" },
    { label: "Team Members", value: "9", icon: "◉", change: "2 online" },
    { label: "Completed", value: "87%", icon: "◇", change: "+5% this month" },
  ];

  const recentActivity = [
    { action: "Project Alpha updated", time: "2 min ago" },
    { action: "New task assigned to you", time: "15 min ago" },
    { action: "Report generated successfully", time: "1 hr ago" },
    { action: "Team meeting scheduled", time: "3 hr ago" },
  ];

  const navItems = [
    { icon: "⊞", label: "Dashboard", active: true },
    { icon: "◈", label: "Projects" },
    { icon: "◎", label: "Tasks" },
    { icon: "◉", label: "Team" },
  ];

  const insightItems = [
    { icon: "◇", label: "Analytics" },
    { icon: "▣", label: "Reports" },
  ];

  const quickActions = [
    { icon: "◈", label: "New Project", sub: "Start from scratch" },
    { icon: "◎", label: "Create Task", sub: "Add to current sprint" },
    { icon: "◉", label: "Invite Member", sub: "Grow your team" },
    { icon: "▣", label: "Generate Report", sub: "Export insights" },
  ];

  const projects = [
    { name: "Website Redesign", pct: 78 },
    { name: "Mobile App v2", pct: 54 },
    { name: "API Integration", pct: 91 },
    { name: "Data Migration", pct: 33 },
  ];

  return (
    <div className="flex min-h-screen bg-sky-50">
      {/* ── Sidebar ── */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-sky-100 flex flex-col z-10 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-7 border-b border-sky-100">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-lg shadow-md shadow-sky-200">
            ⬡
          </div>
          <span className="text-lg font-extrabold text-slate-800 tracking-tight">
            Sky<span className="text-sky-500">Base</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3.5 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2.5 pb-2">
            Main
          </p>
          {navItems.map((item) => (
            <a
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 no-underline
                ${
                  item.active
                    ? "bg-linear-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-200"
                    : "text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                }`}
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
            </a>
          ))}

          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2.5 pb-2 mt-5">
            Insights
          </p>
          {insightItems.map((item) => (
            <a
              key={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-sky-50 hover:text-sky-600 cursor-pointer transition-all duration-150 no-underline"
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
            </a>
          ))}

          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2.5 pb-2 mt-5">
            Settings
          </p>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-sky-50 hover:text-sky-600 cursor-pointer transition-all duration-150 no-underline">
            <span className="w-5 text-center text-base">⚙</span>
            Preferences
          </a>
        </nav>

        {/* User card */}
        <div className="px-3.5 py-4 border-t border-sky-100">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 cursor-pointer transition-colors duration-150">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">
                {user?.user_metadata?.full_name ?? "User"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email ?? "user@example.com"}
              </p>
            </div>
            <span className="text-slate-400 text-sm">⋯</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 h-16 bg-white/80 backdrop-blur-md border-b border-sky-100 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-400 leading-none mt-0.5">
              Welcome back — here's what's happening
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-xl px-3.5 py-2 text-slate-400 text-sm w-52 cursor-text hover:border-sky-300 transition-colors duration-150">
              <span>🔍</span> Search…
            </div>
            <div className="relative w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center cursor-pointer text-base text-slate-500 hover:bg-sky-100 hover:text-sky-600 transition-all duration-150">
              🔔
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 border-2 border-white" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center cursor-pointer text-base text-slate-500 hover:bg-sky-100 hover:text-sky-600 transition-all duration-150">
              ⊕
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-sky-600 via-sky-500 to-sky-400 px-7 py-6 mb-7 flex items-center justify-between">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/[0.07]" />
            <div className="absolute -bottom-14 right-20 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative z-10">
              <h2 className="text-[22px] font-extrabold text-white tracking-tight">
                Good to have you back,{" "}
                {user?.user_metadata?.full_name?.split(" ")[0] ?? "there"} 👋
              </h2>
              <p className="text-sm text-white/75 mt-1">
                You have 4 pending tasks and 2 meetings scheduled for today.
              </p>
            </div>
            <button className="relative z-10 bg-white text-sky-600 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150">
              View Schedule →
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-5 mb-7">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white border border-sky-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {s.label}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-50 to-sky-100 border border-sky-200 flex items-center justify-center text-sky-500 text-base">
                    {s.icon}
                  </div>
                </div>
                <div className="text-[32px] font-extrabold text-slate-800 leading-none tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-md w-fit">
                  {s.change}
                </div>
              </div>
            ))}
          </div>

          {/* Two Column */}
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "1fr 320px" }}
          >
            {/* Left — Progress + Activity */}
            <div className="bg-white border border-sky-100 rounded-2xl overflow-hidden">
              {/* Project Progress header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-sky-50">
                <div>
                  <p className="text-[15px] font-bold text-slate-800">
                    Project Progress
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Current sprint overview
                  </p>
                </div>
                <button className="text-xs font-semibold text-sky-500 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors duration-150">
                  View All
                </button>
              </div>

              <div className="px-5 py-4 flex flex-col gap-4">
                {projects.map((p) => (
                  <div key={p.name} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-slate-700">
                        {p.name}
                      </span>
                      <span className="text-xs font-bold text-sky-600 font-mono">
                        {p.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-sky-50 rounded-full overflow-hidden border border-sky-100">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-sky-400 to-sky-600 transition-all duration-1000"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity header */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-b border-sky-100 mt-2">
                <div>
                  <p className="text-[15px] font-bold text-slate-800">
                    Recent Activity
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Latest updates across projects
                  </p>
                </div>
                <button className="text-xs font-semibold text-sky-500 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors duration-150">
                  See More
                </button>
              </div>

              <div>
                {recentActivity.map((a, i) => (
                  <div
                    key={a.action}
                    className={`flex items-start gap-3 px-5 py-3.5 hover:bg-sky-50 cursor-pointer transition-colors duration-150 ${
                      i < recentActivity.length - 1
                        ? "border-b border-sky-50"
                        : ""
                    }`}
                  >
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-sky-400 shrink-0 ring-[3px] ring-sky-100" />
                    <div>
                      <p className="text-[13px] font-medium text-slate-700 leading-snug">
                        {a.action}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {a.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Quick Actions */}
            <div className="bg-white border border-sky-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-sky-50">
                <p className="text-[15px] font-bold text-slate-800">
                  Quick Actions
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Shortcuts for common tasks
                </p>
              </div>
              <div className="p-4 flex flex-col gap-2.5">
                {quickActions.map((q) => (
                  <button
                    key={q.label}
                    className="group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-sky-50 border border-sky-100 hover:bg-linear-to-r hover:from-sky-500 hover:to-sky-600 hover:border-transparent hover:shadow-lg hover:shadow-sky-200 transition-all duration-150 text-left w-full"
                  >
                    <div className="w-8 h-8 rounded-[9px] bg-sky-100 group-hover:bg-white/20 flex items-center justify-center text-sky-600 group-hover:text-white text-base shrink-0 transition-all duration-150">
                      {q.icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-700 group-hover:text-white transition-colors duration-150">
                        {q.label}
                      </p>
                      <p className="text-[11px] text-slate-400 group-hover:text-white/70 mt-0.5 transition-colors duration-150">
                        {q.sub}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
