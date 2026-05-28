import { clsx } from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-lg border border-black/10 bg-white shadow-sm", className)} {...props} />;
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const styles = {
    primary: "bg-ink text-white hover:bg-ink/90",
    secondary: "bg-teal text-ink hover:bg-teal/90",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-ink hover:bg-black/5"
  };

  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "bad" | "neutral" }) {
  const styles = {
    good: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-900",
    bad: "bg-red-100 text-red-800",
    neutral: "bg-zinc-100 text-zinc-700"
  };

  return <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", styles[tone])}>{children}</span>;
}

