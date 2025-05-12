"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      Cookies.set("token", token, { path: "/", sameSite: "lax" });
      router.replace("/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [params, router]);

  return <div className="text-center">Processing login...</div>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
} 
