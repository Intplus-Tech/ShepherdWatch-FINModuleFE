import * as React from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F9FA] text-[#9CA3AF]">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <h3 className="text-[14px] font-semibold text-[#111827]">{title}</h3>
        {description ? (
          <p className="text-[12px] text-[#6B7280]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
