import { Public_Sans } from "next/font/google";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export default function BranchLeadPastorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute workspace="branchlead-pastor">
      <div
        className={publicSans.variable}
        style={{ "--font-sans": "var(--font-public-sans)" } as React.CSSProperties}
      >
        {children}
      </div>
    </ProtectedRoute>
  );
}
