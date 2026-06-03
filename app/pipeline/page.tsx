'use client';

import { useState, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Stage = 'new' | 'contacted' | 'estimate' | 'followup' | 'won';

interface Lead {
  id: number;
  name: string;
  service: string;
  amount: number;
  time: string;
  badge?: '⚠️' | '🔥' | '✅';
  badgeLabel?: string;
  stage: Stage;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */
const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'new', label: 'New Leads', color: '#3b82f6' },
  { key: 'contacted', label: 'Contacted', color: '#00d4ff' },
  { key: 'estimate', label: 'Estimate Sent', color: '#f59e0b' },
  { key: 'followup', label: 'Follow-Up', color: '#a855f7' },
  { key: 'won', label: 'Won / Closed', color: '#10b981' },
];

const nextStage: Record<Stage, Stage | null> = {
  new: 'contacted',
  contacted: 'estimate',
  estimate: 'followup',
  followup: 'won',
  won: null,
};

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('all');
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await fetch('/api/pipeline');
      const data = await res.json();
      
      const mapLead = (c: any, stage: Stage): Lead => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        service: c.equipmentType || 'HVAC Service',
        amount: c.estimateAmount || c.totalSpent || 0,
        time: new Date(c.updatedAt).toLocaleDateString(),
        stage
      });

      const allLeads = [
        ...(data.NEW || []).map((c: any) => mapLead(c, 'new')),
        ...(data.CONTACTED || []).map((c: any) => mapLead(c, 'contacted')),
        ...(data.ESTIMATE || []).map((c: any) => mapLead(c, 'estimate')),
        ...(data.WON || []).map((c: any) => mapLead(c, 'won')),
      ];
      
      setLeads(allLeads);
    } catch (err) {
      console.error('Failed to load pipeline', err);
    }
  };

  const moveLead = (id: number) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = nextStage[l.stage];
        if (!next) return l;
        return {
          ...l,
          stage: next,
          badge: next === 'won' ? '✅' as const : l.badge,
          badgeLabel: next === 'won' ? 'Closed' : l.badgeLabel,
        };
      }),
    );
    setOpenMenu(null);
  };

  const byStage = (stage: Stage) => leads.filter((l) => l.stage === stage);
  const stageValue = (stage: Stage) => byStage(stage).reduce((s, l) => s + l.amount, 0);
  const totalValue = leads.reduce((s, l) => s + l.amount, 0);

  const funnel = STAGES.map((s) => {
    const count = byStage(s.key).length;
    return { ...s, count, pct: leads.length > 0 ? Math.round((count / leads.length) * 100) : 0 };
  });

  return (
    <>
      <style>{`
        /* ─── CSS Variables ─── */
        .pipeline-page {
          --bg-deep: #0a0f1e;
          --bg-card: rgba(255,255,255,0.05);
          --bg-card-hover: rgba(255,255,255,0.08);
          --border: rgba(255,255,255,0.1);
          --border-light: rgba(255,255,255,0.06);
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --cyan: #00d4ff;
          --blue: #3b82f6;
          --green: #10b981;
          --amber: #f59e0b;
          --purple: #a855f7;
          --red: #ef4444;
          --radius: 16px;
          --radius-sm: 10px;
          --glass: blur(20px);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ─── Page wrapper ─── */
        .pipeline-page {
          min-height: 100vh;
          background: var(--bg-deep);
          color: var(--text-primary);
          padding: 32px 36px 48px;
        }

        /* ─── Header ─── */
        .pipeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .pipeline-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #fff 0%, var(--cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pipeline-header p {
          margin: 4px 0 0;
          color: var(--text-secondary);
          font-size: 14px;
        }
        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .btn-add {
          background: linear-gradient(135deg, var(--cyan), var(--blue));
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0,212,255,0.3);
        }
        .filter-select {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          backdrop-filter: var(--glass);
          cursor: pointer;
          transition: border-color 0.3s ease;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        .filter-select:hover { border-color: var(--cyan); }

        /* ─── Stats Bar ─── */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }
        .stat-badge {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px 20px;
          backdrop-filter: var(--glass);
          transition: all 0.3s ease;
        }
        .stat-badge:hover {
          background: var(--bg-card-hover);
          border-color: rgba(255,255,255,0.15);
        }
        .stat-badge .stat-label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 4px;
        }
        .stat-badge .stat-value {
          font-size: 22px;
          font-weight: 700;
        }
        .stat-cyan  .stat-value { color: var(--cyan); }
        .stat-green .stat-value { color: var(--green); }
        .stat-amber .stat-value { color: var(--amber); }
        .stat-blue  .stat-value { color: var(--blue); }

        /* ─── Kanban Board ─── */
        .kanban-board {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
          margin-bottom: 32px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .kanban-board::-webkit-scrollbar { height: 6px; }
        .kanban-board::-webkit-scrollbar-track { background: transparent; }
        .kanban-board::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 3px;
        }

        /* ─── Column ─── */
        .kanban-col {
          min-width: 290px;
          max-width: 310px;
          flex: 1 0 290px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          backdrop-filter: var(--glass);
          display: flex;
          flex-direction: column;
          scroll-snap-align: start;
          overflow: hidden;
        }
        .col-header {
          padding: 16px 18px 14px;
          border-bottom: 1px solid var(--border-light);
          position: relative;
        }
        .col-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          border-radius: var(--radius) var(--radius) 0 0;
        }
        .col-blue   .col-header::before { background: var(--blue); }
        .col-cyan   .col-header::before { background: var(--cyan); }
        .col-amber  .col-header::before { background: var(--amber); }
        .col-purple .col-header::before { background: var(--purple); }
        .col-green  .col-header::before { background: var(--green); }

        .col-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .col-title {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .col-count {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          line-height: 1.4;
        }
        .col-blue   .col-count { background: rgba(59,130,246,0.2); color: var(--blue); }
        .col-cyan   .col-count { background: rgba(0,212,255,0.15); color: var(--cyan); }
        .col-amber  .col-count { background: rgba(245,158,11,0.2); color: var(--amber); }
        .col-purple .col-count { background: rgba(168,85,247,0.2); color: var(--purple); }
        .col-green  .col-count { background: rgba(16,185,129,0.2); color: var(--green); }

        .col-value {
          font-size: 12px;
          color: var(--text-muted);
        }

        .col-cards {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          max-height: 480px;
          flex: 1;
        }
        .col-cards::-webkit-scrollbar { width: 4px; }
        .col-cards::-webkit-scrollbar-track { background: transparent; }
        .col-cards::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }

        /* ─── Lead Card ─── */
        .lead-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 14px;
          cursor: default;
          transition: all 0.3s ease;
          position: relative;
        }
        .lead-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.14);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }
        .card-name {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .card-dots {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 16px;
          padding: 2px 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          line-height: 1;
          position: relative;
        }
        .card-dots:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }

        .card-service {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .card-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-amount {
          font-size: 14px;
          font-weight: 700;
        }
        .col-blue   .card-amount { color: var(--blue); }
        .col-cyan   .card-amount { color: var(--cyan); }
        .col-amber  .card-amount { color: var(--amber); }
        .col-purple .card-amount { color: var(--purple); }
        .col-green  .card-amount { color: var(--green); }

        .card-time {
          font-size: 11px;
          color: var(--text-muted);
        }
        .card-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 20px;
          margin-top: 8px;
          font-weight: 500;
        }
        .badge-warn  { background: rgba(245,158,11,0.15); color: var(--amber); }
        .badge-hot   { background: rgba(239,68,68,0.15); color: var(--red); }
        .badge-done  { background: rgba(16,185,129,0.15); color: var(--green); }

        /* ─── Card Context Menu ─── */
        .card-menu {
          position: absolute;
          top: 32px;
          right: 8px;
          background: #1a1f36;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 4px;
          z-index: 20;
          min-width: 160px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.5);
          animation: menuIn 0.15s ease;
        }
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .card-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: none;
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s ease;
          text-align: left;
        }
        .card-menu button:hover { background: rgba(255,255,255,0.08); }
        .card-menu .move-btn { color: var(--cyan); font-weight: 500; }

        /* ─── Funnel / Summary ─── */
        .pipeline-summary {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px 32px;
          backdrop-filter: var(--glass);
        }
        .summary-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 24px;
          color: var(--text-primary);
        }
        .funnel {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .funnel-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .funnel-label {
          width: 130px;
          font-size: 13px;
          color: var(--text-secondary);
          text-align: right;
          flex-shrink: 0;
        }
        .funnel-bar-track {
          flex: 1;
          height: 32px;
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        .funnel-bar-fill {
          height: 100%;
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding-left: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          min-width: 50px;
        }
        .funnel-pct {
          width: 44px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        /* ─── Responsive ─── */
        @media (max-width: 900px) {
          .pipeline-page { padding: 20px 16px 36px; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .kanban-col { min-width: 260px; max-width: 280px; flex: 1 0 260px; }
          .funnel-label { width: 90px; font-size: 12px; }
        }
        @media (max-width: 540px) {
          .stats-bar { grid-template-columns: 1fr 1fr; gap: 10px; }
          .stat-badge .stat-value { font-size: 18px; }
          .pipeline-header h1 { font-size: 22px; }
          .header-actions { width: 100%; }
          .kanban-col { min-width: 240px; }
          .pipeline-summary { padding: 20px 16px; }
          .funnel-label { width: 70px; font-size: 11px; }
        }
      `}</style>

      <div className="pipeline-page" onClick={() => setOpenMenu(null)}>
        {/* ── Header ── */}
        <header className="pipeline-header">
          <div>
            <h1>Sales Pipeline</h1>
            <p>Track leads from first contact to closed deal</p>
          </div>
          <div className="header-actions">
            <select
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button className="btn-add">
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Lead
            </button>
          </div>
        </header>

        {/* ── Stats Bar ── */}
        <div className="stats-bar">
          <div className="stat-badge stat-cyan">
            <div className="stat-label">Total Leads</div>
            <div className="stat-value">{leads.length}</div>
          </div>
          <div className="stat-badge stat-green">
            <div className="stat-label">Pipeline Value</div>
            <div className="stat-value">${(totalValue / 1000).toFixed(1)}k</div>
          </div>
          <div className="stat-badge stat-amber">
            <div className="stat-label">Avg Close Time</div>
            <div className="stat-value">8.3 days</div>
          </div>
          <div className="stat-badge stat-blue">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">
              {leads.length > 0
                ? `${Math.round((byStage('won').length / leads.length) * 100)}%`
                : '0%'}
            </div>
          </div>
        </div>

        {/* ── Kanban Board ── */}
        <div className="kanban-board">
          {STAGES.map((stage) => {
            const cards = byStage(stage.key);
            const value = stageValue(stage.key);
            const colClass =
              stage.key === 'new'
                ? 'col-blue'
                : stage.key === 'contacted'
                  ? 'col-cyan'
                  : stage.key === 'estimate'
                    ? 'col-amber'
                    : stage.key === 'followup'
                      ? 'col-purple'
                      : 'col-green';

            return (
              <div className={`kanban-col ${colClass}`} key={stage.key}>
                {/* Column header */}
                <div className="col-header">
                  <div className="col-title-row">
                    <span className="col-title">
                      {stage.label}
                      <span className="col-count">{cards.length}</span>
                    </span>
                  </div>
                  <div className="col-value">{fmtFull(value)}</div>
                </div>

                {/* Cards */}
                <div className="col-cards">
                  {cards.map((lead) => {
                    const next = nextStage[lead.stage];
                    const nextLabel = next
                      ? STAGES.find((s) => s.key === next)?.label
                      : null;

                    return (
                      <div className="lead-card" key={lead.id}>
                        <div className="card-top-row">
                          <span className="card-name">{lead.name}</span>
                          <button
                            className="card-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === lead.id ? null : lead.id);
                            }}
                            aria-label="Actions"
                          >
                            ⋮
                          </button>

                          {openMenu === lead.id && (
                            <div
                              className="card-menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {nextLabel && (
                                <button
                                  className="move-btn"
                                  onClick={() => moveLead(lead.id)}
                                >
                                  → Move to {nextLabel}
                                </button>
                              )}
                              <button>📋 View Details</button>
                              <button>📞 Call Customer</button>
                              <button>✉️ Send Email</button>
                            </div>
                          )}
                        </div>

                        <div className="card-service">{lead.service}</div>

                        <div className="card-bottom-row">
                          <span className="card-amount">{fmtFull(lead.amount)}</span>
                          <span className="card-time">{lead.time}</span>
                        </div>

                        {lead.badge && (
                          <span
                            className={`card-badge ${
                              lead.badge === '⚠️'
                                ? 'badge-warn'
                                : lead.badge === '🔥'
                                  ? 'badge-hot'
                                  : 'badge-done'
                            }`}
                          >
                            {lead.badge} {lead.badgeLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Pipeline Summary / Funnel ── */}
        <div className="pipeline-summary">
          <div className="summary-title">Pipeline Conversion Funnel</div>
          <div className="funnel">
            {funnel.map((step) => {
              const maxCount = Math.max(...funnel.map((f) => f.count));
              const widthPct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;

              return (
                <div className="funnel-row" key={step.key}>
                  <span className="funnel-label">
                    {step.label}
                  </span>
                  <div className="funnel-bar-track">
                    <div
                      className="funnel-bar-fill"
                      style={{
                        width: `${Math.max(widthPct, 8)}%`,
                        background: `linear-gradient(90deg, ${step.color}, ${step.color}88)`,
                      }}
                    >
                      {step.count}
                    </div>
                  </div>
                  <span className="funnel-pct" style={{ color: step.color }}>
                    {step.pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
