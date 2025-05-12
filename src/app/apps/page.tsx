"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api/apps";

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
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<App | null>(null);
  const [showDelete, setShowDelete] = useState<App | null>(null);

  // Form state
  const [form, setForm] = useState({ name: "", retentionDays: 30 });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
      const data = await api.fetchApps();
      setApps(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch apps");
    } finally {
      setFetching(false);
    }
  }

  function openAdd() {
    setForm({ name: "", retentionDays: 30 });
    setFormError(null);
    setShowAdd(true);
  }
  function openEdit(app: App) {
    setForm({ name: app.name, retentionDays: app.retentionDays });
    setFormError(null);
    setShowEdit(app);
  }
  function openDelete(app: App) {
    setShowDelete(app);
  }

  async function handleAddOrEdit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      if (showEdit) {
        await api.updateApp(showEdit.id, form);
      } else {
        await api.createApp(form.name, form.retentionDays);
      }
      setShowAdd(false);
      setShowEdit(null);
      fetchAll();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to save app");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!showDelete) return;
    setFormLoading(true);
    try {
      await api.deleteApp(showDelete.id);
      setShowDelete(null);
      fetchAll();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to delete app");
    } finally {
      setFormLoading(false);
    }
  }

  if (loading || fetching) {
    return <div className="flex justify-center items-center h-64 text-accent">Loading...</div>;
  }
  if (!user) {
    return null;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-accent">Your Applications</h1>
      <div className="bg-white/10 rounded-xl p-6 shadow border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-300">List, create, and manage your logging applications here.</p>
          <button onClick={openAdd} className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg font-semibold shadow transition-colors">+ Add App</button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-secondary border-b border-white/10">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Retention (days)</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-gray-500">No apps found.</td></tr>
              )}
              {apps.map(app => (
                <tr
                  key={app.id}
                  className="border-b border-white/5 hover:bg-accent/10 transition-colors cursor-pointer"
                  onClick={() => router.push(`/apps/${app.id}`)}
                >
                  <td className="py-2 pr-4 font-medium text-white">{app.name}</td>
                  <td className="py-2 pr-4">{app.retentionDays}</td>
                  <td className="py-2 pr-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 pr-4 flex gap-2">
                    <button onClick={e => { e.stopPropagation(); openEdit(app); }} className="px-3 py-1 rounded bg-accent-light text-primary hover:bg-accent">Edit</button>
                    <button onClick={e => { e.stopPropagation(); openDelete(app); }} className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleAddOrEdit} className="bg-primary rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-accent mb-2">{showEdit ? "Edit App" : "Add App"}</h2>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 bg-secondary border border-primary rounded-md text-primary placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Retention Days</label>
              <input
                type="number"
                value={form.retentionDays}
                onChange={e => setForm(f => ({ ...f, retentionDays: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-secondary border border-primary rounded-md text-primary placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent"
                min={1}
                max={365}
                required
              />
            </div>
            {formError && <div className="text-red-500 text-sm text-center">{formError}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowAdd(false); setShowEdit(null); }} className="px-4 py-2 rounded bg-secondary text-primary hover:bg-primary">Cancel</button>
              <button type="submit" disabled={formLoading} className="px-4 py-2 rounded bg-accent text-white hover:bg-accent-dark disabled:opacity-60">{formLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-primary rounded-xl p-6 w-full max-w-sm shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-red-500 mb-2">Delete App</h2>
            <p className="text-gray-300">Are you sure you want to delete <span className="font-semibold text-white">{showDelete.name}</span>? This cannot be undone.</p>
            {formError && <div className="text-red-500 text-sm text-center">{formError}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowDelete(null)} className="px-4 py-2 rounded bg-secondary text-primary hover:bg-primary">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={formLoading} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60">{formLoading ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
