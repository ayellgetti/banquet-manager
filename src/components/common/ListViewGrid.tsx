import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

export const ListViewGrid = ({ children, className }: Props) => (
  <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>{children}</div>
);
