"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="text-center max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
        Authentication Error
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        {error === "Configuration"
          ? "There is a problem with the server configuration."
          : error === "AccessDenied"
          ? "You do not have permission to sign in."
          : error === "Verification"
          ? "The verification token has expired or has already been used."
          : "An error occurred during authentication."}
      </p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}

// Wrap the component in Suspense
export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              Loading...
            </h1>
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
