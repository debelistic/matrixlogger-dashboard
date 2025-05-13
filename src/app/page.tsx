
"use client";

import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);
  if (loading || !user) {
    return null; // or a spinner
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="bg-white/10 rounded-2xl shadow-lg border border-white/10 p-8 max-w-xl w-full flex flex-col items-center">
        <Image src="/logo_with_text.webp" alt="MatrixLogger logo" width={180} height={40} className="mb-6" priority />
        <h1 className="text-3xl font-bold text-accent mb-2 text-center">Welcome to MatrixLogger Dashboard</h1>
        <p className="text-gray-300 text-center mb-6">Manage your apps, view logs, and configure your settings all in one place.</p>
        <Link href="/dashboard" className="bg-accent/80 hover:bg-accent text-white px-6 py-2 rounded-xl font-semibold shadow transition-colors">Go to Dashboard</Link>
      </div>
    </div>
  );
}
