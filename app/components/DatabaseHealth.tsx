'use client';

import { useEffect, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Static Data                                                        */
/* ------------------------------------------------------------------ */

const OVERALL_SCORE = 67;

const breakdownRows = [
  { label: 'Has Email', pct: 78, color: '#10b981' },
  { label: 'Has Phone', pct: 92, color: '#10b981' },
  { label: 'Recent Service (<12mo)', pct: 34, color: '#ef4444' },
  { label: 'Tagged/Segmented', pct: 45, color: '#f59e0b' },
  { label: 'Active Membership', pct: 23, color: '#ef4444' },
];

const insights = [
  { icon: '⚠️', text: '445 contacts have no service in 12+ months' },
  { icon: '🔥', text: '127 contacts have equipment older than 10 years' },
  { icon: '💡', text: '312 contacts are eligible for reactivation' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(pct: number) {
  if (pct > 75) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DatabaseHealth() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* SVG ring math */
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeOffset = mounted
    ? CIRCUMFERENCE - (OVERALL_SCORE / 100) * CIRCUMFERENCE
    : CIRCUMFERENCE;

  const ringColor = scoreColor(OVERALL_SCORE);

  return (
    <>
      <style>{`
        /* -------- Animations -------- */
        @keyframes dbhFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dbhBarGrow {
          from { width: 0; }
        }

        /* -------- Card -------- */
        .dbh-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem;
          animation: dbhFadeIn 0.65s ease both;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .dbh-card:hover {
          border-color: rgba(255,255,255,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }

        /* -------- Section Title -------- */
        .dbh-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 0.25rem;
        }
        .dbh-subtitle {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          margin: 0 0 1.25rem;
        }

        /* -------- Ring -------- */
        .dbh-ring-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .dbh-ring-svg {
          transform: rotate(-90deg);
          filter: drop-shadow(0 0 10px var(--dbh-ring-glow, rgba(245,158,11,0.3)));
        }
        .dbh-ring-bg {
          fill: none;
          stroke: rgba(255,255,255,0.06);
          stroke-width: 10;
        }
        .dbh-ring-fg {
          fill: none;
          stroke-width: 10;
          stroke-linecap: round;
          transition: stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dbh-ring-label {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }
        .dbh-ring-pct {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .dbh-ring-caption {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.45);
          margin-top: 4px;
          font-weight: 500;
        }

        /* -------- Breakdown rows -------- */
        .dbh-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          margin-bottom: 1.5rem;
        }
        .dbh-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .dbh-row-label {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
          min-width: 150px;
          flex-shrink: 0;
        }
        .dbh-row-track {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.07);
          border-radius: 100px;
          overflow: hidden;
        }
        .dbh-row-fill {
          height: 100%;
          border-radius: 100px;
          animation: dbhBarGrow 1s ease both;
        }
        .dbh-row-pct {
          font-size: 0.78rem;
          font-weight: 600;
          min-width: 38px;
          text-align: right;
          flex-shrink: 0;
        }

        /* -------- Insights -------- */
        .dbh-insights {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          margin-bottom: 1.5rem;
        }
        .dbh-insight {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.75rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .dbh-insight:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
        }
        .dbh-insight-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }
        .dbh-insight-text {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.72);
          line-height: 1.4;
        }

        /* -------- Action Button -------- */
        .dbh-action {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 1.15rem;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-family: inherit;
          background: linear-gradient(135deg, #00d4ff 0%, #3b82f6 100%);
          color: #fff;
          box-shadow: 0 3px 14px rgba(0,212,255,0.22);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .dbh-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 22px rgba(0,212,255,0.38);
        }

        /* -------- Responsive -------- */
        @media (max-width: 640px) {
          .dbh-row-label { min-width: 110px; font-size: 0.74rem; }
        }
      `}</style>

      <div className="dbh-card">
        <div className="dbh-title">Database Health Score</div>
        <div className="dbh-subtitle">CRM data quality overview</div>

        {/* ---- Circular Progress Ring ---- */}
        <div className="dbh-ring-wrap">
          <svg
            className="dbh-ring-svg"
            width="140"
            height="140"
            viewBox="0 0 128 128"
            style={{ '--dbh-ring-glow': `${ringColor}55` } as React.CSSProperties}
          >
            <circle className="dbh-ring-bg" cx="64" cy="64" r={RADIUS} />
            <circle
              className="dbh-ring-fg"
              cx="64"
              cy="64"
              r={RADIUS}
              stroke={ringColor}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
            />
          </svg>
          <div className="dbh-ring-label">
            <span className="dbh-ring-pct" style={{ color: ringColor }}>
              {OVERALL_SCORE}%
            </span>
            <span className="dbh-ring-caption">Health Score</span>
          </div>
        </div>

        {/* ---- Health Breakdown ---- */}
        <div className="dbh-breakdown">
          {breakdownRows.map((r, i) => (
            <div className="dbh-row" key={r.label}>
              <span className="dbh-row-label">{r.label}</span>
              <div className="dbh-row-track">
                <div
                  className="dbh-row-fill"
                  style={{
                    width: `${r.pct}%`,
                    background: r.color,
                    animationDelay: `${0.3 + i * 0.1}s`,
                  }}
                />
              </div>
              <span className="dbh-row-pct" style={{ color: r.color }}>
                {r.pct}%
              </span>
            </div>
          ))}
        </div>

        {/* ---- Quick Insights ---- */}
        <div className="dbh-insights">
          {insights.map((ins) => (
            <div className="dbh-insight" key={ins.text}>
              <span className="dbh-insight-icon">{ins.icon}</span>
              <span className="dbh-insight-text">{ins.text}</span>
            </div>
          ))}
        </div>

        {/* ---- Action Button ---- */}
        <button className="dbh-action">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v4.5m0 0L4.5 3M7 5.5L9.5 3M1.5 9v2.5a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5V9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Run Database Cleanup
        </button>
      </div>
    </>
  );
}
