"use client";

import { FormEvent, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  departmentId: string;
};

type Dashboard = {
  totalExpenses: string;
  pendingReimbursements: number;
  recentExpenses: Array<{
    id: string;
    amount: string;
    category: string;
    description: string;
    expenseDate: string;
    status: string;
  }>;
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [email, setEmail] = useState("employee@example.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSession(token: string) {
    const [meResponse, dashboardResponse] = await Promise.all([
      fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    if (!meResponse.ok || !dashboardResponse.ok) {
      localStorage.removeItem("enterprise-ai-token");
      throw new Error("Your session is no longer valid");
    }

    const me = await meResponse.json();
    const summary = await dashboardResponse.json();
    setUser(me.user);
    setDashboard(summary);
  }

  useEffect(() => {
    const token = localStorage.getItem("enterprise-ai-token");
    if (!token) return;
    loadSession(token).catch(() => undefined);
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Login failed");

      localStorage.setItem("enterprise-ai-token", data.token);
      await loadSession(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("enterprise-ai-token");
    setUser(null);
    setDashboard(null);
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Enterprise AI Assistant</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Access your enterprise workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                required
              />
            </label>

            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-xs leading-5 text-slate-500">
            Demo account: employee@example.com / Password123!
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[250px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-950 p-6 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Enterprise</p>
            <h2 className="mt-2 text-xl font-bold">AI Assistant</h2>
          </div>
          <nav className="mt-10 space-y-2 text-sm">
            <div className="rounded-lg bg-white/10 px-4 py-3 font-semibold">Dashboard</div>
            <div className="rounded-lg px-4 py-3 text-slate-300">Expenses</div>
            <div className="rounded-lg px-4 py-3 text-slate-300">Reimbursements</div>
            <div className="rounded-lg px-4 py-3 text-slate-300">Assistant</div>
          </nav>
          <button onClick={logout} className="mt-10 w-full rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10">
            Log out
          </button>
        </aside>

        <section className="p-6 lg:p-10">
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-slate-500">Workspace overview</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-950">Good to see you, {user.name.split(" ")[0]}.</h1>
              <p className="mt-2 text-sm text-slate-500">{user.role} · Your authenticated enterprise dashboard</p>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total expenses</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">₹{dashboard?.totalExpenses ?? "—"}</p>
              <p className="mt-2 text-sm text-slate-500">Visible within your current role scope.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Pending reimbursements</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{dashboard?.pendingReimbursements ?? "—"}</p>
              <p className="mt-2 text-sm text-slate-500">Requests awaiting review.</p>
            </article>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Recent expenses</h2>
                <p className="mt-1 text-sm text-slate-500">Live data from PostgreSQL through the Express API.</p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="pb-3 pr-6 font-medium">Description</th>
                    <th className="pb-3 pr-6 font-medium">Category</th>
                    <th className="pb-3 pr-6 font-medium">Date</th>
                    <th className="pb-3 pr-6 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard?.recentExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-4 pr-6 font-medium text-slate-800">{expense.description}</td>
                      <td className="py-4 pr-6 text-slate-600">{expense.category}</td>
                      <td className="py-4 pr-6 text-slate-600">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                      <td className="py-4 pr-6 font-semibold text-slate-800">₹{expense.amount}</td>
                      <td className="py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{expense.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!dashboard?.recentExpenses.length && <p className="py-8 text-sm text-slate-500">No expenses found.</p>}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
