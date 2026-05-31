'use client';

import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Static Data                                                        */
/* ------------------------------------------------------------------ */

const steps = [
  { label: 'Create Account', done: true },
  { label: 'Upload Contacts', done: true },
  { label: 'Configure Settings', done: true },
  { label: 'Connect Twilio', done: false, action: 'Connect →' },
  { label: 'Connect AI Provider', done: false, action: 'Connect →' },
  { label: 'Launch First Campaign', done: false, action: 'Launch →' },
];

const COMPLETED = steps.filter((s) => s.done).length;
const TOTAL = steps.length;
const PROGRESS_PCT = Math.round((COMPLETED / TOTAL) * 100);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <style>{`
        /* -------- Animations -------- */
        @keyframes obSlideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes obProgressFill {
          from { width: 0; }
        }
        @keyframes obPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.6; }
        }

        /* -------- Banner Wrapper -------- */
        .ob-banner {
          position: relative;
          border-radius: 16px;
          padding: 2px;                        /* gradient border trick */
          background: linear-gradient(135deg, #00d4ff, #3b82f6, #00d4ff);
          background-size: 200% 200%;
          animation: obSlideIn 0.55s ease both;
          margin-bottom: 1.5rem;
        }

        /* -------- Inner Card -------- */
        .ob-inner {
          background: rgba(10, 15, 30, 0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 14px;
          padding: 1.35rem 1.5rem 1.25rem;
        }

        /* -------- Header Row -------- */
        .ob-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          gap: 1rem;
        }
        .ob-title {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ob-badge {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 6px;
          background: rgba(0,212,255,0.12);
          color: #00d4ff;
        }
        .ob-dismiss {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          flex-shrink: 0;
          font-family: inherit;
          line-height: 1;
        }
        .ob-dismiss:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }

        /* -------- Steps Row -------- */
        .ob-steps {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.1rem;
        }
        .ob-step {
          flex: 1 1 140px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          transition: background 0.25s ease, border-color 0.25s ease;
          min-width: 0;
        }
        .ob-step:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
        }
        .ob-step--done {
          border-color: rgba(16,185,129,0.2);
        }

        .ob-check {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          flex-shrink: 0;
        }
        .ob-check--done {
          background: rgba(16,185,129,0.18);
          color: #10b981;
        }
        .ob-check--pending {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.15);
          color: transparent;
        }

        .ob-step-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .ob-step-label {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.75);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ob-step--done .ob-step-label {
          color: rgba(255,255,255,0.55);
          text-decoration: line-through;
          text-decoration-color: rgba(255,255,255,0.2);
        }
        .ob-step-link {
          font-size: 0.72rem;
          font-weight: 600;
          color: #00d4ff;
          cursor: pointer;
          transition: color 0.2s ease;
          text-decoration: none;
          margin-top: 1px;
        }
        .ob-step-link:hover {
          color: #3bb8ff;
        }

        /* -------- Progress Bar -------- */
        .ob-progress-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .ob-progress-track {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.07);
          border-radius: 100px;
          overflow: hidden;
        }
        .ob-progress-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, #00d4ff, #3b82f6);
          animation: obProgressFill 1.1s ease both;
          animation-delay: 0.3s;
        }
        .ob-progress-text {
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          flex-shrink: 0;
        }

        /* -------- Responsive -------- */
        @media (max-width: 768px) {
          .ob-steps { gap: 0.4rem; }
          .ob-step  { flex: 1 1 100%; }
        }
      `}</style>

      <div className="ob-banner">
        <div className="ob-inner">
          {/* ---- Header ---- */}
          <div className="ob-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span className="ob-title">🚀 Get Started — Complete your setup</span>
              <span className="ob-badge">{COMPLETED}/{TOTAL} complete</span>
            </div>
            <button
              className="ob-dismiss"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss onboarding banner"
            >
              ✕
            </button>
          </div>

          {/* ---- Steps ---- */}
          <div className="ob-steps">
            {steps.map((s) => (
              <div
                key={s.label}
                className={`ob-step ${s.done ? 'ob-step--done' : ''}`}
              >
                <div className={`ob-check ${s.done ? 'ob-check--done' : 'ob-check--pending'}`}>
                  {s.done ? '✓' : ''}
                </div>
                <div className="ob-step-content">
                  <span className="ob-step-label">{s.label}</span>
                  {!s.done && s.action && (
                    <a className="ob-step-link">{s.action}</a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ---- Progress Bar ---- */}
          <div className="ob-progress-wrap">
            <div className="ob-progress-track">
              <div
                className="ob-progress-fill"
                style={{ width: `${PROGRESS_PCT}%` }}
              />
            </div>
            <span className="ob-progress-text">{PROGRESS_PCT}%</span>
          </div>
        </div>
      </div>
    </>
  );
}
