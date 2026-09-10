import { Public_Sans } from "next/font/google";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export default function BranchAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute workspace="branch-admin">
      <div
        className={publicSans.variable}
        style={{ "--font-sans": "var(--font-public-sans)" } as React.CSSProperties}
      >
        {children}
      </div>
    </ProtectedRoute>
  );
}
