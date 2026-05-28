"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, FileClock, FlaskConical, RadioTower, Rocket, ScrollText } from "lucide-react";
import { clsx } from "clsx";

const nav = [
  { href: "/ops", label: "Health", icon: Activity },
  { href: "/ops/incidents", label: "Incidents", icon: RadioTower },
  { href: "/ops/logs", label: "Logs", icon: FileClock },
  { href: "/ops/deployments", label: "Deploys", icon: Rocket },
  { href: "/ops/runbooks", label: "Runbooks", icon: ScrollText },
  { href: "/ops/simulations", label: "Sim", icon: FlaskConical }
];

export function OpsNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/ops" ? pathname === "/ops" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition",
              active
                ? "bg-aqua/15 text-aqua ring-1 ring-aqua/20"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon size={17} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
