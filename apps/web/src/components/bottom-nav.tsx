"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, History, Home, QrCode, Send } from "lucide-react";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/pay", label: "Pay", icon: Send },
  { href: "/scan", label: "Scan", icon: QrCode },
  { href: "/transactions", label: "History", icon: History },
  { href: "/support", label: "Support", icon: CircleHelp }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-slate-900/8 bg-white/95 px-2 pb-3 pt-2 backdrop-blur">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            className={active ? "flex flex-col items-center gap-1 rounded-xl bg-midnight px-1 py-2 text-[11px] font-semibold text-white shadow-sm ring-1 ring-midnight/10" : "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-900/5 hover:text-midnight"}
            href={item.href}
          >
            <Icon size={18} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
