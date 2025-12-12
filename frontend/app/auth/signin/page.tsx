'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  useEffect(() => {
    signIn('auth0', { callbackUrl: '/trials' });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-zinc-600 dark:text-zinc-400">Redirecting to login...</p>
      </div>
    </div>
  );
}

