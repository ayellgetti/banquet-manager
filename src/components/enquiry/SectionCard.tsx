import { ReactNode } from "react";

export const SectionCard = ({
  title,
  description,
  required,
  children,
}: {
  title: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-shadow hover:shadow-gold sm:p-7">
    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gradient-gold opacity-90" />
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
          {required && <span aria-hidden="true" className="ml-1 text-destructive">*</span>}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);