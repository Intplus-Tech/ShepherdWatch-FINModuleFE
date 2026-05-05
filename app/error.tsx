"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Catches errors thrown in this segment's
 * components and shows a safe, user-friendly UI without leaking stack traces.
 *
 * Next.js automatically renders this for any uncaught error inside `app/`.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the browser console in dev; production could forward to a
    // monitoring service (e.g. Sentry) here. The `digest` is a server-side
    // identifier that maps to the full stack in your hosting logs.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-16 bg-[#F8FAFC]">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-2xl">
          !
        </div>
        <h1 className="text-xl font-semibold text-[#0F172A]">
          Something went wrong
        </h1>
        <p className="text-sm text-[#64748B]">
          An unexpected error occurred while loading this page. Please try
          again. If the problem persists, contact support.
        </p>
        {error.digest ? (
          <p className="text-xs text-[#94A3B8] font-mono">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="flex gap-3 pt-2">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
