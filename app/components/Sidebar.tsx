'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: '📊', label: 'Dashboard', href: '/' },
  { icon: '👥', label: 'Contacts', href: '/contacts' },
  { icon: '📨', label: 'Messages', href: '/messages' },
  { icon: '🚀', label: 'Campaigns', href: '/campaigns' },
  { icon: '🎮', label: 'Simulator', href: '/simulator' },
  { icon: '💰', label: 'ROI Calculator', href: '/roi-calculator' },
  { icon: '📋', label: 'Pipeline', href: '/pipeline' },
  { icon: '📝', label: 'Templates', href: '/templates' },
  { icon: '⭐', label: 'Reviews', href: '/reviews' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* Backdrop overlay for mobile */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Brand / Logo */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">❄</span>
          </div>
          <div className="sidebar-brand-text">
            <h1 className="sidebar-title">HVAC Recovery</h1>
            <span className="sidebar-subtitle">Revenue Platform</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar-link ${active ? 'sidebar-link--active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span className="sidebar-link-label">{item.label}</span>
                    {active && <span className="sidebar-link-indicator" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          <div className="sidebar-divider" />

          {/* System status */}
          <div className="sidebar-status">
            <div className="sidebar-status-row">
              <span className="sidebar-status-dot" />
              <div className="sidebar-status-text">
                <span className="sidebar-status-label">System Status</span>
                <span className="sidebar-status-value">All systems operational</span>
              </div>
            </div>
          </div>

          {/* Version info */}
          <div className="sidebar-version">
            v1.0.0 — Free Tier
          </div>
        </div>
      </aside>
    </>
  );
}
