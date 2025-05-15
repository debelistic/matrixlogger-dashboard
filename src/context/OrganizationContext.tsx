'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Organization, fetchOrganizations } from '../api/organizations';
import { useAuth } from './AuthContext';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  loading: boolean;
  error: string | null;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const refreshOrganizations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const orgs = await fetchOrganizations();
      setOrganizations(orgs);
      
      // If no current org is selected but we have orgs, select the first one
      if (!currentOrganization && orgs.length > 0) {
        setCurrentOrganization(orgs[0]);
      }
      
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      refreshOrganizations();
    }
  }, [user, authLoading]);

  // Redirect to organization selection if needed
  useEffect(() => {
    if (!authLoading && user && !loading) {
      if (organizations.length === 0 && !pathname?.includes('/organizations/new')) {
        router.push('/organizations/new');
      }
    }
  }, [user, authLoading, loading, organizations, pathname, router]);

  const value = {
    organizations,
    currentOrganization,
    setCurrentOrganization,
    loading,
    error,
    refreshOrganizations
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
} 
