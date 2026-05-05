"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary. Replaces the entire app (including the root
 * layout) when an error is thrown in `app/layout.tsx` itself. Must render
 * its own <html> and <body> tags.
 *
 * Stack traces are intentionally hidden — only a digest reference is shown.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#F8FAFC",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          color: "#0F172A",
        }}
      >
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 9999,
              background: "#FEF2F2",
              color: "#DC2626",
              fontSize: 24,
              margin: "0 auto 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 1rem" }}>
            A critical error occurred. Please refresh the page or try again
            later.
          </p>
          {error.digest ? (
            <p
              style={{
                fontSize: 12,
                color: "#94A3B8",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                margin: "0 0 1rem",
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "none",
              background: "#2563EB",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
