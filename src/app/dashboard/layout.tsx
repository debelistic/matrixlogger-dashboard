"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Apps", href: "/apps" },
    { name: "Settings", href: "/settings" },
  ];

  const organizationNavigation = [
    {
      name: 'Settings',
      href: '/organizations/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      name: 'Members',
      href: '/organizations/members',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="bg-[#0e1117] border-r border-zinc-800 w-64 min-h-screen hidden md:flex flex-col px-4 pt-6 pb-6">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logo.webp" alt="MatrixLogger logo" width={48} height={48} className="rounded-lg shadow mb-2" priority />
          <span className="text-xl font-bold text-accent tracking-tight">MatrixLogger</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 text-sm flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg transition-all ${
                pathname === item.href
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-gray-300 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {currentOrganization && (
            <>
              <div className="mt-6 mb-2 px-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Organization
                </h3>
              </div>
              {organizationNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    pathname === item.href
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </>
          )}

          <button
            onClick={logout}
            className="mt-2 px-3 py-2 text-left rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            Logout
          </button>
        </nav>

        {/* Organization Selector */}
        <div className="mt-4 border-t border-zinc-800 pt-4 relative">
          <button
            onClick={() => setShowOrgModal(!showOrgModal)}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
          >
            <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-accent font-semibold">
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
              className="absolute bottom-16 left-0 w-full p-2 bg-[#1b1f25] text-white rounded-lg border border-zinc-700 shadow-lg max-h-60 overflow-y-auto z-50"
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
                      currentOrganization?._id === org._id ? 'bg-accent text-black' : 'hover:bg-zinc-800'
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
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-accent/10 text-white hover:bg-accent/20 transition-colors mt-2 border-t border-zinc-700 pt-3"
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

        {/* User info */}
        {user && (
          <div className="mt-6 border-t border-zinc-800 pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm leading-tight">{user.name}</span>
              <span className="text-gray-500 text-xs leading-tight">{user.email}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
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
