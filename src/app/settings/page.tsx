"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-accent">Loading...</div>;
  }
  if (!user) {
    return null;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-accent">Settings</h1>
      <div className="bg-white/10 rounded-xl p-6 shadow border border-white/10">
        <p className="text-gray-300">Manage your profile, password, and preferences here.</p>
      </div>
    </>
  );
} 
