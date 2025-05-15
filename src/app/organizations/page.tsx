'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { Organization } from '../../api/organizations';

export default function OrganizationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { organizations, loading, error, setCurrentOrganization } = useOrganization();
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleOrganizationSelect = (org: Organization) => {
    setSelectedOrg(org);
    setCurrentOrganization(org);
    router.push(`/organizations/${org.slug}/apps`);
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-400">
          <p>Error: {error}</p>
          <button
            onClick={() => router.refresh()}
            className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Your Organizations</h1>
        <button
          onClick={() => router.push('/organizations/new')}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-black rounded-lg font-medium"
        >
          Create Organization
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
          <h2 className="text-xl font-semibold text-white mb-2">No Organizations Yet</h2>
          <p className="text-gray-400 mb-6">Create your first organization to get started</p>
          <button
            onClick={() => router.push('/organizations/new')}
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-black rounded-lg font-medium"
          >
            Create Organization
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <button
              key={org._id}
              onClick={() => handleOrganizationSelect(org)}
              className={`p-6 rounded-lg border text-left transition-all ${
                selectedOrg?._id === org._id
                  ? 'bg-accent/10 border-accent'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <h3 className="text-lg font-semibold text-white mb-2">{org.name}</h3>
              {org.description && (
                <p className="text-sm text-gray-400 mb-3">{org.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Role: <span className="text-white capitalize">{org.role}</span></span>
                {org.stats && (
                  <>
                    <span>Members: <span className="text-white">{org.stats.members}</span></span>
                    <span>Apps: <span className="text-white">{org.stats.apps}</span></span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 
