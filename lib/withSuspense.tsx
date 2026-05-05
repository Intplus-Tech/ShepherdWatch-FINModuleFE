"use client";

import { Suspense, type ComponentType, type ReactNode } from "react";

/**
 * Wraps a client component in a React Suspense boundary.
 *
 * Required for any page/component that calls hooks which can suspend during
 * static prerender (e.g. `useSearchParams`, `usePathname` in some cases).
 * Use this instead of `export const dynamic = "force-dynamic"` so the
 * surrounding shell can still be statically optimized.
 *
 * @example
 * function PageInner() {
 *   const params = useSearchParams();
 *   // ...
 * }
 *
 * export default withSuspense(PageInner);
 */
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback: ReactNode = null,
): ComponentType<P> {
  const Wrapped = (props: P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
  Wrapped.displayName = `withSuspense(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped;
}
