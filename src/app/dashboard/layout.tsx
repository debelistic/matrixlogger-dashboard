"use client";
import Link from "next/link";
import "../globals.css";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

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
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-0 left-0 z-50 w-full flex items-center bg-primary border-b border-primary h-14 px-4">
        <div className="flex-1 flex items-center gap-2">
          <Image src="/logo_with_text.webp" alt="MatrixLogger" width={160} height={32} className="h-8 w-auto" priority />
        </div>
        {/* You can add a mobile menu button here for a drawer if desired */}
      </div>
      {/* Main content */}
      <main className="flex-1 min-h-screen bg-background px-2 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
} 
