'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/contacts': 'Contacts',
  '/messages': 'Messages',
  '/campaigns': 'Campaigns',
  '/simulator': 'Simulator',
  '/roi-calculator': 'ROI Calculator',
  '/pipeline': 'Pipeline',
  '/templates': 'Templates',
  '/reviews': 'Reputation & Reviews',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  // Match nested routes
  const base = '/' + pathname.split('/').filter(Boolean)[0];
  return pageTitles[base] || 'Dashboard';
}

export default function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">{title}</h2>
      </div>

      <div className="header-right">
        {/* Notification bell */}
        <button className="header-icon-btn" aria-label="Notifications">
          <span className="header-bell">🔔</span>
          <span className="header-notification-badge" />
        </button>

        {/* User avatar */}
        <div className="header-user">
          <div className="header-avatar">A</div>
          <span className="header-username">Admin</span>
          <span className="header-chevron">▾</span>
        </div>
      </div>
    </header>
  );
}
