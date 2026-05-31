'use client';

import { useEffect, useState } from 'react';
import OnboardingChecklist from './components/OnboardingChecklist';
import DatabaseHealth from './components/DatabaseHealth';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const stats = [
  {
    label: 'Total Revenue Recovered',
    value: '$26,310',
    trend: '+12.5%',
    trendDir: 'up' as const,
    icon: '💰',
    color: '#10b981',
  },
  {
    label: 'Active Campaigns',
    value: '6',
    trend: '2 launching soon',
    trendDir: 'neutral' as const,
    icon: '🚀',
    color: '#3b82f6',
  },
  {
    label: 'Leads Engaged',
    value: '142',
    trend: '+23 this week',
    trendDir: 'up' as const,
    icon: '👥',
    color: '#00d4ff',
  },
  {
    label: 'Response Rate',
    value: '34.2%',
    trend: '+4.1% vs avg',
    trendDir: 'up' as const,
    icon: '📈',
    color: '#a855f7',
  },
];

const chartData = [
  { month: 'Jan', amount: 3200, pct: 38 },
  { month: 'Feb', amount: 4100, pct: 49 },
  { month: 'Mar', amount: 3800, pct: 45 },
  { month: 'Apr', amount: 5400, pct: 64 },
  { month: 'May', amount: 4500, pct: 54 },
  { month: 'Jun', amount: 5310, pct: 63 },
];

const activities = [
  { icon: '📞', text: 'Missed call from John Smith — auto text sent', time: '2 min ago', color: '#f59e0b' },
  { icon: '⭐', text: 'New 5-star review collected from Sarah Johnson', time: '15 min ago', color: '#10b981' },
  { icon: '💰', text: 'Estimate #4521 accepted — $3,200 recovered', time: '42 min ago', color: '#00d4ff' },
  { icon: '🔄', text: 'Dormant lead Mike Davis reactivated', time: '1 hr ago', color: '#a855f7' },
  { icon: '📧', text: 'Follow-up email sent to 12 pending estimates', time: '2 hr ago', color: '#3b82f6' },
  { icon: '📞', text: 'Missed call from Lisa Chen — auto text sent', time: '3 hr ago', color: '#f59e0b' },
  { icon: '⭐', text: 'New 4-star review collected from Robert Wilson', time: '4 hr ago', color: '#10b981' },
  { icon: '💰', text: 'Estimate #4519 accepted — $1,850 recovered', time: '5 hr ago', color: '#00d4ff' },
];

const campaigns = [
  {
    name: 'Lead Reactivation',
    icon: '🔄',
    sent: 45,
    responded: 12,
    metric: '$4,500 recovered',
    progress: 67,
    color: '#00d4ff',
  },
  {
    name: 'Estimate Follow-Up',
    icon: '📋',
    sent: 28,
    responded: 8,
    metric: '$4,800 recovered',
    progress: 82,
    color: '#10b981',
  },
  {
    name: 'Review Collection',
    icon: '⭐',
    sent: 35,
    responded: 18,
    metric: '14 reviews collected',
    progress: 51,
    color: '#a855f7',
  },
  {
    name: 'Membership Renewal',
    icon: '🔑',
    sent: 22,
    responded: 13,
    metric: '$2,160 recovered',
    progress: 59,
    color: '#f59e0b',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in after mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ---------- Scoped styles ---------- */}
      <style>{`
        /* -------- Animations -------- */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.08); }
          50%      { box-shadow: 0 0 30px rgba(0, 212, 255, 0.18); }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes progressFill {
          from { width: 0; }
        }

        /* -------- Dashboard wrapper -------- */
        .dashboard {
          opacity: 0;
          transition: opacity 0.6s ease;
          padding: 0 0 2rem;
        }
        .dashboard--visible { opacity: 1; }

        /* -------- Page Header -------- */
        .dash-header {
          margin-bottom: 2rem;
          animation: fadeInUp 0.6s ease both;
        }
        .dash-header h1 {
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 0%, #00d4ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.35rem;
          line-height: 1.25;
        }
        .dash-header p {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        /* -------- Glass Card (base) -------- */
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(255,255,255,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }

        /* -------- Stats Row -------- */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease both;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 16px 16px 0 0;
        }
        .stat-card-inner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .stat-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.35rem;
          flex-shrink: 0;
        }
        .stat-value {
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0.5rem 0 0.2rem;
          line-height: 1.1;
        }
        .stat-label {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.5rem;
        }
        .stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .stat-trend--up {
          color: #10b981;
          background: rgba(16,185,129,0.12);
        }
        .stat-trend--neutral {
          color: #3b82f6;
          background: rgba(59,130,246,0.12);
        }

        /* -------- Main Grid (chart + activity) -------- */
        .main-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        /* -------- Chart -------- */
        .chart-card {
          animation: fadeInUp 0.7s ease both;
          animation-delay: 0.15s;
        }
        .chart-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 0.25rem;
        }
        .chart-subtitle {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          margin: 0 0 1.5rem;
        }
        .chart-area {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          height: 220px;
          padding-top: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .chart-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          height: 100%;
          justify-content: flex-end;
        }
        .chart-amount {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.55);
          font-weight: 600;
        }
        .chart-bar {
          width: 100%;
          max-width: 52px;
          border-radius: 8px 8px 4px 4px;
          background: linear-gradient(180deg, #00d4ff 0%, #3b82f6 100%);
          transform-origin: bottom;
          animation: barGrow 0.8s ease both;
          position: relative;
          transition: filter 0.3s ease, box-shadow 0.3s ease;
        }
        .chart-bar:hover {
          filter: brightness(1.2);
          box-shadow: 0 0 20px rgba(0,212,255,0.35);
        }
        .chart-month {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.45);
          padding-top: 0.6rem;
          font-weight: 500;
        }

        /* -------- Activity Feed -------- */
        .activity-card {
          animation: fadeInUp 0.7s ease both;
          animation-delay: 0.25s;
        }
        .activity-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 0.25rem;
        }
        .activity-subtitle {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          margin: 0 0 1rem;
        }
        .activity-list {
          display: flex;
          flex-direction: column;
        }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.5rem;
          border-radius: 10px;
          transition: background 0.25s ease;
          cursor: default;
        }
        .activity-item:hover {
          background: rgba(255,255,255,0.04);
        }
        .activity-item + .activity-item {
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .activity-icon-wrap {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .activity-text {
          flex: 1;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.78);
          line-height: 1.45;
        }
        .activity-time {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.3);
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* -------- Campaign Grid -------- */
        .section-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 1rem;
        }
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
          align-items: start;
        }
        .campaign-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .campaign-card {
          animation: fadeInUp 0.7s ease both;
        }
        .campaign-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1rem;
        }
        .campaign-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.15rem;
        }
        .campaign-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
        }
        .campaign-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem 1rem;
          margin-bottom: 1rem;
        }
        .campaign-stat-item {
          display: flex;
          flex-direction: column;
        }
        .campaign-stat-num {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
        }
        .campaign-stat-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.4);
        }
        .campaign-metric {
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .progress-track {
          height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 100px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 100px;
          animation: progressFill 1.2s ease both;
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-top: 0.4rem;
        }
        .progress-label span {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.35);
        }

        /* -------- Quick Actions -------- */
        .quick-actions {
          display: flex;
          gap: 1rem;
          animation: fadeInUp 0.7s ease both;
          animation-delay: 0.35s;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .btn-primary {
          background: linear-gradient(135deg, #00d4ff 0%, #3b82f6 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(0,212,255,0.25);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(0,212,255,0.4);
        }
        .btn-secondary {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }
        .btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .btn-ghost:hover {
          color: #00d4ff;
          border-color: rgba(0,212,255,0.3);
          transform: translateY(-2px);
        }

        /* -------- Responsive -------- */
        @media (max-width: 1080px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .main-grid { grid-template-columns: 1fr; }
          .bottom-grid { grid-template-columns: 1fr; }
          .campaign-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr; }
          .campaign-grid { grid-template-columns: 1fr; }
          .chart-area { height: 160px; gap: 0.6rem; }
          .quick-actions { flex-direction: column; }
          .btn { justify-content: center; }
          .dash-header h1 { font-size: 1.45rem; }
        }
      `}</style>

      <div className={`dashboard ${visible ? 'dashboard--visible' : ''}`}>
        {/* =============== Onboarding Checklist =============== */}
        <OnboardingChecklist />

        {/* =============== 1. Page Header =============== */}
        <header className="dash-header">
          <h1>Revenue Recovery Dashboard</h1>
          <p>Real-time overview of your HVAC revenue operations</p>
        </header>

        {/* =============== 2. Top Stats Row =============== */}
        <div className="stats-row">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="glass-card stat-card"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  borderRadius: '16px 16px 0 0',
                  background: `linear-gradient(90deg, ${s.color}, transparent)`,
                }}
              />
              <div className="stat-card-inner">
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <span
                    className={`stat-trend stat-trend--${s.trendDir}`}
                  >
                    {s.trendDir === 'up' && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                      </svg>
                    )}
                    {s.trend}
                  </span>
                </div>
                <div
                  className="stat-icon"
                  style={{ background: `${s.color}18` }}
                >
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* =============== 3. Chart + 4. Activity Feed =============== */}
        <div className="main-grid">
          {/* ---- Revenue Chart ---- */}
          <div className="glass-card chart-card">
            <div className="chart-title">Revenue Recovery Trend</div>
            <div className="chart-subtitle">Monthly recovery over the last 6 months</div>
            <div className="chart-area">
              {chartData.map((d, i) => (
                <div className="chart-col" key={d.month}>
                  <span className="chart-amount">
                    ${(d.amount / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="chart-bar"
                    style={{
                      height: `${d.pct}%`,
                      animationDelay: `${0.3 + i * 0.1}s`,
                    }}
                  />
                </div>
              ))}
            </div>
            {/* Month labels */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              {chartData.map((d) => (
                <div key={d.month} style={{ flex: 1, textAlign: 'center' }}>
                  <span className="chart-month">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Activity Feed ---- */}
          <div className="glass-card activity-card">
            <div className="activity-title">Recent Activity</div>
            <div className="activity-subtitle">Latest actions &amp; notifications</div>
            <div className="activity-list">
              {activities.map((a, i) => (
                <div className="activity-item" key={i}>
                  <div
                    className="activity-icon-wrap"
                    style={{ background: `${a.color}14` }}
                  >
                    {a.icon}
                  </div>
                  <span className="activity-text">{a.text}</span>
                  <span className="activity-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =============== 5. Campaign + Database Health =============== */}
        <div className="section-title" style={{ animationDelay: '0.2s' }}>
          Campaign Performance
        </div>
        <div className="bottom-grid">
          <div className="campaign-grid">
            {campaigns.map((c, i) => (
              <div
                key={c.name}
                className="glass-card campaign-card"
                style={{ animationDelay: `${0.2 + i * 0.08}s` }}
              >
                <div className="campaign-header">
                  <div
                    className="campaign-icon"
                    style={{ background: `${c.color}18` }}
                  >
                    {c.icon}
                  </div>
                  <span className="campaign-name">{c.name}</span>
                </div>

                <div className="campaign-stats">
                  <div className="campaign-stat-item">
                    <span className="campaign-stat-num">{c.sent}</span>
                    <span className="campaign-stat-label">Sent</span>
                  </div>
                  <div className="campaign-stat-item">
                    <span className="campaign-stat-num">{c.responded}</span>
                    <span className="campaign-stat-label">Responded</span>
                  </div>
                </div>

                <div className="campaign-metric" style={{ color: c.color }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 7L6.5 8.5L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {c.metric}
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${c.progress}%`,
                      background: `linear-gradient(90deg, ${c.color}, ${c.color}88)`,
                      animationDelay: `${0.4 + i * 0.1}s`,
                    }}
                  />
                </div>
                <div className="progress-label">
                  <span>Progress</span>
                  <span>{c.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* ---- Database Health Widget ---- */}
          <DatabaseHealth />
        </div>

        {/* =============== 6. Quick Actions =============== */}
        <div className="quick-actions">
          <button className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Run Reactivation Campaign
          </button>
          <button className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v6m0 0L5 4m3 3l3-3M2 10v3a2 2 0 002 2h8a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Upload New Contacts
          </button>
          <button className="btn btn-ghost">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="2.5" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1.5 5.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            View All Messages
          </button>
        </div>
      </div>
    </>
  );
}
