"use client";

import { useState } from "react";
import { installCsrfInterceptors } from "@/lib/csrf-client";

/**
 * Installs the CSRF request interceptors once, before any child renders or
 * fires a request. `useState` with an initialiser runs during the first render
 * rather than in an effect, so a mutation triggered by a child's mount is
 * already covered.
 */
export function CsrfProvider({ children }: { children: React.ReactNode }) {
  useState(() => {
    installCsrfInterceptors();
    return null;
  });

  return <>{children}</>;
}
