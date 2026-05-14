import { Public_Sans } from "next/font/google";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ModalProvider } from "@/components/providers/ModalContext";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export default function BranchAccountPastorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRoles={["accountant", "branch_accountant"]}>
      <ModalProvider>
        <div
          className={publicSans.variable}
          style={{ "--font-sans": "var(--font-public-sans)" } as React.CSSProperties}
        >
          {children}
        </div>
      </ModalProvider>
    </ProtectedRoute>
  );
}
