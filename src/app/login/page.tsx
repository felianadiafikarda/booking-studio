'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function RedirectToAuthLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(redirectParam)}`);
    } else {
      router.replace('/auth/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  );
}

export default function LoginPageRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <RedirectToAuthLogin />
    </Suspense>
  );
}

