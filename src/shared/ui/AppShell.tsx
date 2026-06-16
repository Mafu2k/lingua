"use client";

import { Languages, MessagesSquare, ScanText, Type } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Type;
}

const NAV: NavItem[] = [
  { href: "/text", label: "Text", icon: Type },
  { href: "/ocr", label: "Image", icon: ScanText },
  { href: "/conversation", label: "Live", icon: MessagesSquare }
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border px-5 py-7 md:flex">
        <Brand />
        <nav className="mt-10 flex flex-col gap-1.5" aria-label="Primary">
          {NAV.map((item) => (
            <SideLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-muted">Light / Dark</span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-5 py-4 md:hidden">
          <Brand />
          <ThemeToggle />
        </header>

        <main className="flex-1 px-4 pb-28 pt-2 sm:px-6 md:px-10 md:pb-10 md:pt-8">{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t border-border bg-surface/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
        aria-label="Primary"
      >
        {NAV.map((item) => (
          <TabLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent text-accent-contrast shadow-soft">
        <Languages className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-text">Lingua</span>
    </Link>
  );
}

function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
        active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-raised hover:text-text"
      )}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
        active ? "text-accent" : "text-muted"
      )}
    >
      <Icon className={cn("h-6 w-6 transition-transform", active && "scale-110")} />
      {item.label}
    </Link>
  );
}
