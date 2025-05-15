'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganization } from '../../../context/OrganizationContext';
import { createOrganization } from '../../../api/organizations';

export default function NewOrganizationPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshOrganizations } = useOrganization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createOrganization({ name, description });
      await refreshOrganizations();
      router.push('/organizations');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-accent hover:underline text-sm font-medium flex items-center gap-1"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-white mt-4">Create New Organization</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent"
            placeholder="Enter organization name"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent"
            rows={3}
            placeholder="Enter organization description"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-accent text-black rounded-lg font-medium ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/90'
            }`}
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  );
} 
