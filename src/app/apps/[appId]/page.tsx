"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import * as appsApi from "../../../api/apps";
import * as logsApi from "../../../api/logs";

interface App {
  id: string;
  name: string;
  apiKey: string;
  retentionDays: number;
  createdAt: string;
}

interface Log {
  id: string;
  appId: string;
  message: string;
  level?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export default function AppDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appId = params?.appId as string;
  const [app, setApp] = useState<App | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [fetching, setFetching] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && appId) fetchAll();
    // eslint-disable-next-line
  }, [user, appId]);

  async function fetchAll() {
    setFetching(true);
    setError(null);
    try {
      const apps = await appsApi.fetchApps();
      const found = apps.find((a: App) => a.id === appId);
      setApp(found);
      const logs = await logsApi.fetchLogs(appId, 100);
      setLogs(logs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load app details");
    } finally {
      setFetching(false);
    }
  }

  if (loading || fetching) {
    return <div className="flex justify-center items-center h-64 text-accent">Loading...</div>;
  }
  if (!user || !app) {
    return <div className="text-center text-gray-400 mt-12">App not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push("/apps")}
          className="text-accent hover:underline text-sm font-medium flex items-center gap-1">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Back to Apps
        </button>
        <h1 className="text-2xl font-bold text-accent flex-1">{app.name}</h1>
      </div>
      <div className="bg-white/10 rounded-xl p-6 shadow border border-white/10 mb-8">
        <div className="mb-2 text-gray-400 text-sm">API Key:</div>
        <div className="font-mono text-accent text-lg break-all mb-2">{app.apiKey}</div>
        <div className="text-gray-400 text-sm">Retention: <span className="text-white font-semibold">{app.retentionDays} days</span></div>
        <div className="text-gray-400 text-sm">Created: <span className="text-white font-semibold">{new Date(app.createdAt).toLocaleDateString()}</span></div>
      </div>
      <div className="bg-white/10 rounded-xl p-6 shadow border border-white/10">
        <h2 className="text-lg font-semibold mb-4 text-white">Recent Logs</h2>
        {logs.length === 0 ? (
          <div className="text-gray-400">No logs found for this app.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {logs.map((log, i) => (
              <li key={log.id || i} className="py-2">
                <div className="text-xs text-gray-400 mb-1">{new Date(log.timestamp).toLocaleString()}</div>
                <div className="text-white font-mono text-sm">{log.message}</div>
                {log.level && <span className="inline-block text-xs px-2 py-0.5 rounded bg-accent/20 text-accent ml-2">{log.level}</span>}
                {log.metadata && <pre className="text-xs text-gray-400 mt-1">{JSON.stringify(log.metadata, null, 2)}</pre>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 
