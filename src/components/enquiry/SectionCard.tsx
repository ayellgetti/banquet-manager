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
  <div className="rounded-xl border bg-card p-6 shadow-sm">
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-foreground">
        {title}
        {required && <span aria-hidden="true" className="ml-1 text-destructive">*</span>}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </div>
);