"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/servers", label: "Servers" },
  { href: "/players", label: "Players" },
  { href: "/config", label: "Config" }
];

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span aria-hidden>🛡️</span>
          GM Dashboard
        </div>
        <nav className="sidebar__nav" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar__link${isActive ? " sidebar__link--active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar__footer">Env: Production · Role: GM Operator</div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="topbar__search">
            <input type="search" placeholder="Search players, servers, tickets" />
          </div>
          <div className="topbar__actions">
            <span className="topbar__badge">Live Ops</span>
            <span>Alerts: 3</span>
            <span>Shift: 09:00 - 17:00</span>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
