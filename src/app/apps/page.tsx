"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api/apps";
import toast from "react-hot-toast";

interface App {
  id: string;
  name: string;
  apiKey: string;
  retentionDays: number;
  createdAt: string;
}

export default function AppsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [fetching, setFetching] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<App | null>(null);
  const [showDelete, setShowDelete] = useState<App | null>(null);
  const [form, setForm] = useState({ name: "", retentionDays: 30 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  async function fetchAll() {
    setFetching(true);
    setError(null);
    try {
      const data = await api.fetchApps();
      setApps(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch apps");
    } finally {
      setFetching(false);
    }
  }

  async function handleAddOrEdit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      if (showEdit) {
        await api.updateApp(showEdit.id, form);
        toast.success("App updated successfully");
      } else {
        await api.createApp(form.name, form.retentionDays);
        toast.success("App created successfully");
      }
      setShowAdd(false);
      setShowEdit(null);
      fetchAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save app";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!showDelete) return;
    setFormLoading(true);
    try {
      await api.deleteApp(showDelete.id);
      toast.success("App deleted successfully");
      setShowDelete(null);
      fetchAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to delete app";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  }

  if (loading || fetching) {
    return <div className="text-center py-20 text-gray-400 animate-pulse">Loading apps...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Your Applications</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
        >
          + Add App
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map(app => (
          <div
            key={app.id}
            className="bg-gray-800 rounded-lg p-4 border border-white/10 hover:border-accent transition cursor-pointer"
            onClick={() => router.push(`/apps/${app.id}`)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">{app.name}</h2>
              <span className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Retention: {app.retentionDays} days</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="text-blue-400 hover:underline"
                onClick={e => { e.stopPropagation(); setShowEdit(app); setForm({ name: app.name, retentionDays: app.retentionDays }); }}
              >Edit</button>
              <button
                className="text-red-400 hover:underline"
                onClick={e => { e.stopPropagation(); setShowDelete(app); }}
              >Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals reused */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleAddOrEdit} className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4 text-white">{showEdit ? "Edit App" : "Add New App"}</h2>
            <label className="block text-sm text-gray-300 mb-1">App Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 mb-4 bg-gray-800 rounded-md border border-gray-600 text-white focus:ring-2 focus:ring-accent"
              required
            />
            <label className="block text-sm text-gray-300 mb-1">Retention Days</label>
            <input
              type="number"
              value={form.retentionDays}
              onChange={e => setForm({ ...form, retentionDays: Number(e.target.value) })}
              className="w-full px-4 py-2 mb-4 bg-gray-800 rounded-md border border-gray-600 text-white focus:ring-2 focus:ring-accent"
              min={1}
              max={365}
              required
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowAdd(false); setShowEdit(null); }} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">Cancel</button>
              <button type="submit" disabled={formLoading} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark disabled:opacity-50">{formLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm shadow-lg border border-white/10">
            <h2 className="text-xl font-semibold text-red-500 mb-3">Delete App</h2>
            <p className="text-gray-300 mb-4">Are you sure you want to delete <strong>{showDelete.name}</strong>?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowDelete(null)} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={formLoading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{formLoading ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
