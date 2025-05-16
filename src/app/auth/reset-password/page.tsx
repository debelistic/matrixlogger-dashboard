'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '../../../api/auth';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Invalid reset link');
      router.push('/auth/login');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      toast.success('Password has been reset successfully');
      router.push('/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your new password below
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="New password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="font-medium text-accent hover:text-accent-light"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
