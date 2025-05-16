"use client";
import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../../../components/ui/FormInput';
import { AlertError } from '../../../components/ui/AlertError';
import { forgotPassword } from '../../../api/auth';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  // const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);
      await forgotPassword(data.email);
      setSuccess(true);
      toast.success('Password reset instructions have been sent to your email');
    } catch {
      setError('root', {
        type: 'manual',
        message: 'Failed to process password reset request. Please try again.',
      });
      toast.error('Failed to send reset instructions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissError = () => {
    clearErrors('root');
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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-200">
                  Check your email for password reset instructions.
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/auth/login"
                className="font-medium text-accent hover:text-accent-light"
              >
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root?.message && (
              <AlertError
                message={errors.root.message}
                onDismiss={handleDismissError}
              />
            )}

            <div className="rounded-md shadow-sm">
              <FormInput<ForgotPasswordFormData>
                id="email"
                label="Email address"
                type="email"
                autoComplete="email"
                register={register}
                error={errors.email}
                className="rounded-md"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                aria-disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Sending instructions...
                  </>
                ) : (
                  'Send reset instructions'
                )}
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
        )}
      </div>
    </div>
  );
} 
