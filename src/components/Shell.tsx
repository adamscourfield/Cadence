"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpenCheck, LayoutGrid, LineChart, Mic, Radio, Upload } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/live", label: "Live", icon: Mic },
  { href: "/lessons", label: "Lessons", icon: Radio },
  { href: "/lessons/new", label: "Import", icon: Upload },
  { href: "/behaviour", label: "Behaviour", icon: Award },
  { href: "/insights", label: "Insights", icon: LineChart },
  { href: "/rubric", label: "Rubric", icon: BookOpenCheck },
];

// The mobile tab bar only has room for the five most-used destinations.
const MOBILE_NAV_EXCLUDE = new Set(["/lessons/new", "/behaviour"]);

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/lessons") return pathname === "/lessons" || /^\/lessons\/(?!new)/.test(pathname);
  return pathname.startsWith(href);
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3.5 group">
      <span className="relative grid place-items-center size-10 shrink-0 rounded-[10px] bg-[linear-gradient(135deg,var(--ink),var(--ink-2))] transition-transform group-hover:scale-105">
        <svg width="22" height="22" viewBox="0 0 56 56" fill="none">
          <path d="M10 40 L28 16 L46 40" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="10" cy="40" r="5.5" fill="white" />
          <circle cx="28" cy="16" r="5.5" fill="white" />
          <circle cx="46" cy="40" r="5.5" fill="white" />
        </svg>
      </span>
      <span className="font-semibold tracking-tight text-[17px]">Cadence</span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="relative z-10 flex min-h-screen">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col gap-8 border-r border-line px-5 py-6 sticky top-0 h-screen">
        <Logo />
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 h-10 text-sm transition-colors ${
                  active ? "bg-panel-strong text-text border border-line" : "text-muted hover:text-text border border-transparent"
                }`}
              >
                <Icon size={16} className={active ? "text-cyan" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link href="/live" className="btn btn-primary mt-auto">
          <Mic size={16} /> Start lesson
        </Link>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between px-4 h-16 border-b border-line sticky top-0 z-30 bg-bg/80 backdrop-blur-xl">
          <Logo />
          <Link href="/live" className="btn btn-primary h-9 px-4">
            <Mic size={14} /> Live
          </Link>
        </header>
        <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 pb-28 lg:pb-10">{children}</main>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-bg/85 backdrop-blur-xl grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {NAV.filter((n) => !MOBILE_NAV_EXCLUDE.has(n.href)).map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${active ? "text-cyan" : "text-muted"}`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
