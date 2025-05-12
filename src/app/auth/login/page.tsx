"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Image from "next/image";
import { useEffect } from "react";

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { login, error, loading, user } = useAuth();
  const router = useRouter();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

  async function onSubmit(data: LoginForm) {
    clearErrors();
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError("root", { message });
    }
  }



  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-2">
      <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-primary rounded-xl shadow-lg">
        {/* App Logo */}
        <div className="flex flex-col items-center mb-2">
          <Image src="/logo.webp" alt="MatrixLogger logo" width={48} height={48} className="rounded-lg shadow" priority />
          <span className="mt-2 text-xl font-bold text-accent tracking-tight">MatrixLogger</span>
        </div>
        {/* Social Auth Buttons */}
        <div className="flex flex-col gap-3 mb-4">
          <a href="/api/v1/auth/github" className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors border border-gray-700">
            <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/></svg>
            Continue with GitHub
          </a>
          <a href="/api/v1/auth/google" className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 rounded-lg transition-colors border border-gray-300">
            <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.13 2.7 30.45 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.19C12.13 14.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.03l7.19 5.6C43.27 37.27 46.1 31.45 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.68a14.5 14.5 0 0 1 0-9.36l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.55l7.98-6.19z"/><path fill="#EA4335" d="M24 48c6.45 0 12.13-2.13 16.63-5.8l-7.19-5.6c-2.01 1.35-4.6 2.15-7.44 2.15-6.38 0-11.87-4.59-13.83-10.81l-7.98 6.19C6.73 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            Continue with Google
          </a>
        </div>
        <div>
          <h2 className="text-center text-2xl font-bold text-accent mb-2">Sign in to your account</h2>
          <p className="mt-2 text-center text-secondary text-sm">
            Or <a href="/auth/register" className="text-accent hover:underline">create a new account</a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary">Email address</label>
              <input id="email" type="email" autoComplete="email" {...formRegister("email")}
                className="mt-1 block w-full px-3 py-2 bg-secondary border border-primary rounded-md text-primary placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent"
              />
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email.message}</div>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary">Password</label>
              <input id="password" type="password" autoComplete="current-password" {...formRegister("password")}
                className="mt-1 block w-full px-3 py-2 bg-secondary border border-primary rounded-md text-primary placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent"
              />
              {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password.message}</div>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="/auth/forgot-password" className="text-accent hover:underline">Forgot your password?</a>
            </div>
          </div>
          {(errors.root || error) && <div className="text-red-500 text-sm text-center">{errors.root?.message || error}</div>}
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 
