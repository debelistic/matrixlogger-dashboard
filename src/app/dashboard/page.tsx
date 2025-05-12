"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as appsApi from "../../api/apps";
import Link from "next/link";

interface App {
  id: string;
  name: string;
  apiKey: string;
  retentionDays: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  async function fetchAll() {
    setFetching(true);
    setError(null);
    try {
      const appsData = await appsApi.fetchApps();
      setApps(appsData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard data");
    } finally {
      setFetching(false);
    }
  }

  if (loading || fetching) {
    return <div className="flex justify-center items-center h-64 text-accent">Loading...</div>;
  }
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-accent">Welcome, {user.name || user.email}!</h1>
      <p className="mb-8 text-gray-400 text-lg">Here&apos;s a quick summary of your MatrixLogger activity.</p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Apps Card */}
        <div className="bg-white/10 rounded-xl p-6 shadow border border-white/10 flex flex-col items-start">
          <div className="flex items-center mb-3">
            <span className="inline-block bg-accent/20 text-accent p-2 rounded-full mr-3">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
            <span className="text-3xl font-bold text-white">{apps.length}</span>
          </div>
          <div className="text-lg font-semibold mb-1 text-white">Your Apps</div>
          <div className="text-gray-400 mb-3">Manage and monitor your logging apps.</div>
          <Link href="/apps" className="text-accent hover:underline font-medium">Go to Apps →</Link>
        </div>
      </div>
      {/* Quick Actions / Get Started */}
      <div className="bg-white/5 rounded-xl p-6 shadow border border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="text-lg text-white font-semibold mb-2 md:mb-0">Quick Actions</div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/apps" className="bg-accent hover:bg-accent-dark text-primary font-semibold px-4 py-2 rounded-lg shadow transition-colors">+ New App</Link>
        </div>
      </div>
    </div>
  );
} 
