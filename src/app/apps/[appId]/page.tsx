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

function getLevelColor(level?: string) {
  switch (level) {
    case "error": return "bg-red-600/20 text-red-400 border border-red-400/30";
    case "warn": return "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30";
    case "info": return "bg-blue-600/20 text-blue-400 border border-blue-400/30";
    case "debug": return "bg-green-600/20 text-green-400 border border-green-400/30";
    default: return "bg-gray-700/20 text-gray-300 border border-gray-400/20";
  }
}

function relativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
          <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
            {logs.map((log, i) => (
              <div
                key={log.id || i}
                className="transition bg-zinc-900/80 border border-white/10 rounded-lg p-4 shadow hover:shadow-lg hover:border-accent/40 group relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs text-gray-400 cursor-help"
                    title={new Date(log.timestamp).toLocaleString()}
                  >
                    {relativeTime(log.timestamp)}
                  </span>
                  {log.level && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold border ${getLevelColor(log.level)}`}
                    >
                      {log.level.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-white font-mono text-sm break-words mb-2">
                  {log.message}
                </div>
                {log.metadata && (
                  <div>
                    <button
                      className="text-xs text-accent hover:underline focus:outline-none mb-1"
                      onClick={() => setExpanded(e => ({ ...e, [log.id]: !e[log.id] }))}
                    >
                      {expanded[log.id] ? "Hide metadata" : "Show metadata"}
                    </button>
                    {expanded[log.id] && (
                      <pre className="text-xs bg-zinc-800/80 rounded p-2 text-gray-300 border border-white/10 overflow-x-auto mt-1">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
