export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-2">
      <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-primary rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-2xl font-bold text-accent mb-2">Forgot your password?</h2>
          <p className="mt-2 text-center text-secondary text-sm">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary">Email address</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 bg-secondary border border-primary rounded-md text-primary placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent" />
            </div>
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">Send reset link</button>
          </div>
        </form>
        <div className="text-center mt-4">
          <a href="/auth/login" className="text-accent hover:underline text-sm">Back to login</a>
        </div>
      </div>
    </div>
  );
} 
