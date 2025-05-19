'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

function JoinOrganizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationNeeded, setRegistrationNeeded] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    const acceptInvitation = async () => {
      try {
        const response = await fetch('/api/organizations/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to accept invitation');
        }

        if (data.needsRegistration) {
          setRegistrationNeeded(true);
          setEmail(data.email);
          setLoading(false);
          return;
        }

        toast.success('Successfully joined organization');
        router.push(`/organizations/${data.organization._id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to accept invitation';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user && !registrationNeeded) {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.href)}`);
      } else {
        acceptInvitation();
      }
    }
  }, [authLoading, user, registrationNeeded, router, searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-accent">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => router.push('/organizations')}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark"
          >
            Go to Organizations
          </button>
        </div>
      </div>
    );
  }

  if (registrationNeeded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h2 className="text-2xl font-bold text-accent">Create Your Account</h2>
          <p className="text-gray-400">
            To accept this invitation, you need to create an account with {email}
          </p>
          <button
            onClick={() => router.push(`/auth/register?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(window.location.href)}`)}
            className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-accent">Processing invitation...</div>
    </div>
  );
}

export default function JoinOrganizationPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-accent">Loading...</div>
      </div>
    }>
      <JoinOrganizationContent />
    </Suspense>
  );
} 
