"use client";
import Link from "next/link";
import "../globals.css";
import { useAuth } from "../../context/AuthContext";
import { useOrganization } from "../../context/OrganizationContext";
import Image from "next/image";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganization();
  const [showOrgModal, setShowOrgModal] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="bg-primary border-r border-primary w-64 min-h-screen hidden md:flex flex-col py-8 px-4 relative">
        <div className="mb-10 flex flex-col items-center">
          <Image src="/logo.webp" alt="MatrixLogger logo" width={48} height={48} className="rounded-lg shadow mb-2" priority />
          <span className="text-2xl font-bold text-accent tracking-tight">MatrixLogger</span>
        </div>
        <nav className="flex flex-col gap-2 text-base flex-1">
          <Link href="/dashboard" className="py-2 px-3 rounded-lg hover:bg-secondary transition-colors">Dashboard</Link>
          <Link href="/apps" className="py-2 px-3 rounded-lg hover:bg-secondary transition-colors">Apps</Link>
          <Link href="/settings" className="py-2 px-3 rounded-lg hover:bg-secondary transition-colors">Settings</Link>
          <button
            onClick={logout}
            className="text-left py-2 px-3 rounded-lg hover:bg-secondary transition-colors text-red-400"
          >
            Logout
          </button>
        </nav>

        {/* Organization Selector */}
        <div className="px-2 py-4 border-t border-primary mt-auto relative">
          <button
            onClick={() => setShowOrgModal(!showOrgModal)}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors group"
          >
            <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center">
              {currentOrganization?.name?.[0] || '?'}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium truncate">{currentOrganization?.name || 'Select Organization'}</div>
              <div className="text-xs text-gray-400">Switch Organization</div>
            </div>
            <svg 
              className={`w-4 h-4 text-gray-400 group-hover:text-white transition-transform ${showOrgModal ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Organization Dropdown */}
          {showOrgModal && (
            <div 
              className="absolute bottom-full left-0 w-full p-2 mb-2 bg-zinc-900 rounded-lg border border-zinc-800 shadow-lg max-h-[calc(100vh-400px)] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-1">
                {organizations.map(org => (
                  <button
                    key={org._id}
                    onClick={() => {
                      setCurrentOrganization(org);
                      setShowOrgModal(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      currentOrganization?._id === org._id ? 'bg-accent text-black' : 'hover:bg-secondary'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      currentOrganization?._id === org._id ? 'bg-black/20' : 'bg-accent/20'
                    }`}>
                      {org.name[0]}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{org.name}</div>
                      <div className="text-xs opacity-70">{org.role}</div>
                    </div>
                    {currentOrganization?._id === org._id && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
                
                <Link
                  href="/organizations/new"
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors mt-2 border-t border-zinc-800 pt-3"
                  onClick={() => setShowOrgModal(false)}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Organization
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User info at the bottom */}
        {user && (
          <div className="absolute bottom-6 left-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm leading-tight">{user.name}</span>
              <span className="text-secondary text-xs leading-tight">{user.email}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 z-50 w-full flex items-center bg-primary border-b border-primary h-14 px-4">
        <div className="flex-1 flex items-center gap-2">
          <Image src="/logo_with_text.webp" alt="MatrixLogger" width={160} height={32} className="h-8 w-auto" priority />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-background px-2 sm:px-6 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
} 
