import type { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
}

export default function Alert({ children }: AlertProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      {children}
    </div>
  );
}
