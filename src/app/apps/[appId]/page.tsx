"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

interface PaginationMeta {
  hasNextPage: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
  limit: number;
}

function formatLogLine(log: Log) {
  const time = new Date(log.timestamp).toLocaleTimeString();
  const level = log.level?.toUpperCase() || "INFO";
  return `[${time}] [${level}] ${log.message}`;
}

function getLevelColor(level?: string) {
  switch (level) {
    case "error": return "text-red-400";
    case "warn": return "text-yellow-400";
    case "info": return "text-blue-400";
    case "debug": return "text-green-400";
    default: return "text-gray-400";
  }
}

export default function AppDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appId = params?.appId as string;
  const [app, setApp] = useState<App | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [fetching, setFetching] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  const fetchApp = useCallback(async () => {
    try {
      const apps = await appsApi.fetchApps();
      const found = apps.find((a: App) => a.id === appId);
      setApp(found || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load app details");
    }
  }, [appId]);

  const fetchLogs = useCallback(async (cursor?: string | null) => {
    if (!appId || (cursor === null && pagination?.hasNextPage === false)) return;
    
    try {
      setFetching(true);
      const response = await logsApi.fetchLogs(appId, {
        limit: 50,
        cursor
      });
      
      setLogs(prev => {
        if (!cursor) return response.data;
        const existingIds = new Set(prev.map(log => log.id));
        const filteredNew = response.data.filter((log: Log) => !existingIds.has(log.id));
        return [...prev, ...filteredNew];
      });
      
      setPagination(response.pagination);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load logs");
    } finally {
      setFetching(false);
    }
  }, [appId, pagination?.hasNextPage]);

  useEffect(() => {
    if (user && appId) {
      setFetching(true);
      fetchApp();
      fetchLogs();
    }
  }, [user, appId, fetchApp, fetchLogs]);

  useEffect(() => {
    const container = logContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
      if (nearBottom && !fetching && pagination?.hasNextPage) {
        fetchLogs(pagination.nextCursor);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [fetchLogs, fetching, pagination]);

  if (loading || fetching && logs.length === 0) {
    return <div className="text-center py-20 text-gray-400 animate-pulse">Loading logs...</div>;
  }
  if (!user || !app) {
    return <div className="text-center text-gray-400 mt-12">App not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/apps")}
          className="text-accent hover:underline text-sm font-medium flex items-center gap-1"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Back to Apps
        </button>
        <h1 className="text-2xl font-bold text-white">{app.name}</h1>
      </div>

      <section className="bg-zinc-900 border border-zinc-700/40 rounded-lg px-6 py-4 mb-8">
        <div className="text-sm text-gray-400 mb-1">API Key:</div>
        <div className="text-accent font-mono text-xs break-all mb-2">{app.apiKey}</div>
        <div className="flex gap-4 text-xs text-gray-400">
          <span>Retention: <span className="text-white font-semibold">{app.retentionDays} days</span></span>
          <span>Created: <span className="text-white font-semibold">{new Date(app.createdAt).toLocaleDateString()}</span></span>
        </div>
      </section>

      <section className="bg-black border border-zinc-800 rounded-lg p-4 shadow-inner max-h-[75vh] overflow-y-auto" ref={logContainerRef}>
        <h2 className="text-base font-semibold text-white mb-4">Logs</h2>
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">No logs found for this app.</div>
        ) : (
          <div className="space-y-3 font-mono text-sm text-white">
            {logs.map((log, i) => (
              <div key={log.id || i} className="group hover:bg-zinc-900/50 px-2 py-1 rounded">
                <div className={`flex justify-between items-start gap-2 ${getLevelColor(log.level)}`}>
                  <div className="whitespace-pre-wrap break-words">{formatLogLine(log)}</div>
                  {log.metadata && (
                    <button
                      onClick={() => setExpanded(e => ({ ...e, [log.id]: !e[log.id] }))}
                      className="text-xs underline text-accent hover:text-white"
                    >
                      {expanded[log.id] ? "Hide" : "Meta"}
                    </button>
                  )}
                </div>
                {expanded[log.id] && log.metadata && (
                  <pre className="text-xs mt-2 p-2 bg-zinc-800 text-gray-300 border border-zinc-700 rounded overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
