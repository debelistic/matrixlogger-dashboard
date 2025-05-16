"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../context/AuthContext';
import { registerSchema, type RegisterFormData } from '../../../schemas/auth';
import { FormInput } from '../../../components/ui/FormInput';
import { AlertError } from '../../../components/ui/AlertError';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { register: registerUser, loading: authLoading, error: authError, user, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      await registerUser(data.name, data.email, data.password);
    } catch {
      setError('root', {
        type: 'manual',
        message: 'Registration failed. Please try again.',
      });
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading && !authError) {
      toast.success('Account created successfully! Redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [user, authLoading, authError, router]);

  const loading = isSubmitting || authLoading;

  const handleDismissError = () => {
    clearErrors('root');
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-8">
            <div className="relative w-[180px] h-[40px]">
              <Image
                src="/logo_with_text.webp"
                alt="MatrixLogger"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-accent hover:text-accent-light">
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {(errors.root?.message || authError) && (
            <AlertError
              message={errors.root?.message || authError || 'An error occurred'}
              onDismiss={handleDismissError}
            />
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <FormInput<RegisterFormData>
              id="name"
              label="Full Name"
              type="text"
              autoComplete="name"
              register={register}
              error={errors.name}
              className="rounded-t-md"
            />
            <FormInput<RegisterFormData>
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              register={register}
              error={errors.email}
            />
            <FormInput<RegisterFormData>
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              register={register}
              error={errors.password}
            />
            <FormInput<RegisterFormData>
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              register={register}
              error={errors.confirmPassword}
              className="rounded-b-md"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
              aria-disabled={loading}
            >
              {loading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-white hover:bg-gray-700"
              >
                <span className="sr-only">Sign up with GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-white hover:bg-gray-700"
              >
                <span className="sr-only">Sign up with Google</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 
