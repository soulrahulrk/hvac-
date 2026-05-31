'use client';

import { useState, useMemo, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function fmtDollar(n: number): string {
  return '$' + fmt(Math.round(n));
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K';
  return '$' + fmt(n);
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function ROICalculatorPage() {
  const [visible, setVisible] = useState(false);

  // ---- Input State ----
  const [annualRevenue, setAnnualRevenue] = useState(1_000_000);
  const [databaseSize, setDatabaseSize] = useState(1200);
  const [avgServiceTicket, setAvgServiceTicket] = useState(450);
  const [avgInstallTicket, setAvgInstallTicket] = useState(4500);
  const [followUpRate, setFollowUpRate] = useState(12);
  const [googleReviews, setGoogleReviews] = useState(43);
  const [monthlyInboundCalls, setMonthlyInboundCalls] = useState(400);
  const [hasMembership, setHasMembership] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // ---- Revenue Calculations ----
  const calculations = useMemo(() => {
    const dormant = databaseSize * 0.28;
    const openEstimates = databaseSize * 0.19;
    const pastCustomers = databaseSize * 0.41;
    const lapsedMembers = databaseSize * 0.12;

    const leadReactivation = dormant * 0.05 * avgServiceTicket;
    const estimateFollowUp = openEstimates * 0.08 * avgInstallTicket;
    const repeatCustomer = pastCustomers * 0.03 * avgServiceTicket;
    const referralCampaigns = monthlyInboundCalls * 0.03 * avgServiceTicket;
    const membershipRenewals = lapsedMembers * 180 * 0.60;
    const reviewImprovement = Math.max(0, Math.floor((databaseSize * 0.02) / 30)) * avgServiceTicket;
    const missedCallRecovery = monthlyInboundCalls * 0.62 * 0.15 * avgServiceTicket;

    const totalMonthly =
      leadReactivation +
      estimateFollowUp +
      repeatCustomer +
      referralCampaigns +
      membershipRenewals +
      reviewImprovement +
      missedCallRecovery;

    const investment = 1797;
    const roi = totalMonthly / investment;

    const projectedReviewGain = Math.round(databaseSize * 0.015);
    const projectedMRR = hasMembership
      ? Math.round(databaseSize * 0.08 * 15)
      : Math.round(databaseSize * 0.05 * 15);

    const rows = [
      {
        name: 'Old Lead Reactivation',
        assumption: `5% of ${fmt(Math.round(dormant))} dormant contacts × $${fmt(avgServiceTicket)}`,
        monthly: leadReactivation,
        icon: '🔄',
        color: '#00d4ff',
      },
      {
        name: 'Estimate Follow-Up',
        assumption: `8% of ${fmt(Math.round(openEstimates))} open estimates × $${fmt(avgInstallTicket)}`,
        monthly: estimateFollowUp,
        icon: '📋',
        color: '#3b82f6',
      },
      {
        name: 'Repeat Customer Campaigns',
        assumption: `3% of ${fmt(Math.round(pastCustomers))} past customers × $${fmt(avgServiceTicket)}`,
        monthly: repeatCustomer,
        icon: '🔁',
        color: '#10b981',
      },
      {
        name: 'Referral Campaigns',
        assumption: `${fmt(monthlyInboundCalls)} calls × 3% referral rate × $${fmt(avgServiceTicket)}`,
        monthly: referralCampaigns,
        icon: '📣',
        color: '#a855f7',
      },
      {
        name: 'Membership Renewals',
        assumption: `${fmt(Math.round(lapsedMembers))} lapsed × $180 × 60% win-back`,
        monthly: membershipRenewals,
        icon: '🔑',
        color: '#f59e0b',
      },
      {
        name: 'Review-Driven Leads',
        assumption: `Review velocity → ${Math.max(0, Math.floor((databaseSize * 0.02) / 30))} new leads/mo`,
        monthly: reviewImprovement,
        icon: '⭐',
        color: '#ec4899',
      },
      {
        name: 'Missed Call Recovery',
        assumption: `${fmt(monthlyInboundCalls)} calls × 62% missed × 15% recovered × $${fmt(avgServiceTicket)}`,
        monthly: missedCallRecovery,
        icon: '📞',
        color: '#14b8a6',
      },
    ];

    return {
      rows,
      totalMonthly,
      totalAnnual: totalMonthly * 12,
      investment,
      roi,
      projectedReviewGain,
      projectedMRR,
      maxRow: Math.max(...rows.map((r) => r.monthly)),
    };
  }, [
    databaseSize,
    avgServiceTicket,
    avgInstallTicket,
    followUpRate,
    googleReviews,
    monthlyInboundCalls,
    hasMembership,
    annualRevenue,
  ]);

  return (
    <>
      {/* ---------- Scoped styles ---------- */}
      <style>{`
        /* -------- Animations -------- */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { text-shadow: 0 0 40px rgba(0, 212, 255, 0.3), 0 0 80px rgba(59, 130, 246, 0.15); }
          50%      { text-shadow: 0 0 60px rgba(0, 212, 255, 0.5), 0 0 120px rgba(59, 130, 246, 0.25); }
        }
        @keyframes shimmerBar {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes progressFill {
          from { width: 0; }
        }
        @keyframes roiBarGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }

        /* -------- Page wrapper -------- */
        .roi-page {
          opacity: 0;
          transition: opacity 0.6s ease;
          padding: 0 0 3rem;
        }
        .roi-page--visible { opacity: 1; }

        /* -------- Page Header -------- */
        .roi-header {
          text-align: center;
          margin-bottom: 2.5rem;
          animation: fadeInUp 0.6s ease both;
        }
        .roi-header h1 {
          font-size: 2.4rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.6rem;
          line-height: 1.2;
        }
        .roi-header p {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.5);
          margin: 0;
          max-width: 560px;
          margin-inline: auto;
        }

        /* -------- Layout Grid -------- */
        .roi-layout {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
          gap: 1.5rem;
          align-items: start;
        }

        /* -------- Glass Card -------- */
        .roi-glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .roi-glass:hover {
          border-color: rgba(255,255,255,0.14);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }

        /* -------- Input Panel -------- */
        .input-panel {
          position: sticky;
          top: 80px;
          animation: fadeInUp 0.6s ease both;
          animation-delay: 0.1s;
        }
        .input-panel-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .input-panel-subtitle {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.4);
          margin: 0 0 1.5rem;
        }

        /* -------- Form Group -------- */
        .roi-form-group {
          margin-bottom: 1.35rem;
        }
        .roi-form-group:last-child {
          margin-bottom: 0;
        }
        .roi-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          margin-bottom: 0.5rem;
        }
        .roi-label-value {
          font-weight: 700;
          color: #00d4ff;
          font-size: 0.88rem;
          font-variant-numeric: tabular-nums;
        }

        /* -------- Custom Range Slider -------- */
        .roi-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 100px;
          outline: none;
          cursor: pointer;
          position: relative;
        }
        .roi-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00d4ff, #3b82f6);
          border: 3px solid #0a0f1e;
          cursor: grab;
          box-shadow: 0 0 12px rgba(0,212,255,0.4);
          transition: box-shadow 0.3s ease, transform 0.2s ease;
        }
        .roi-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 20px rgba(0,212,255,0.6);
          transform: scale(1.15);
        }
        .roi-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
        }
        .roi-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00d4ff, #3b82f6);
          border: 3px solid #0a0f1e;
          cursor: grab;
          box-shadow: 0 0 12px rgba(0,212,255,0.4);
        }
        .roi-slider::-moz-range-track {
          height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 100px;
          border: none;
        }

        /* -------- Number Input -------- */
        .roi-input {
          width: 100%;
          padding: 0.6rem 0.85rem;
          font-size: 0.88rem;
          font-weight: 500;
          color: #fff;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          transition: all 0.3s ease;
          font-family: inherit;
          font-variant-numeric: tabular-nums;
        }
        .roi-input:focus {
          border-color: #00d4ff;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.12);
          background: rgba(255,255,255,0.06);
        }
        .roi-input::placeholder {
          color: rgba(255,255,255,0.25);
        }

        /* -------- Toggle -------- */
        .roi-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .roi-toggle {
          position: relative;
          width: 52px;
          height: 28px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .roi-toggle::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: rgba(255,255,255,0.4);
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .roi-toggle--active {
          background: linear-gradient(135deg, #00d4ff, #3b82f6);
          border-color: transparent;
        }
        .roi-toggle--active::after {
          left: 27px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .roi-toggle-labels {
          display: flex;
          gap: 0.5rem;
          font-size: 0.78rem;
          font-weight: 600;
        }
        .roi-toggle-labels span {
          color: rgba(255,255,255,0.3);
          transition: color 0.3s ease;
        }
        .roi-toggle-labels span.active {
          color: #00d4ff;
        }

        /* -------- Slider Track Fill (visual) -------- */
        .slider-wrap {
          position: relative;
        }

        /* -------- Results Panel -------- */
        .results-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* -------- Hero Number -------- */
        .hero-number-card {
          text-align: center;
          padding: 2.5rem 2rem;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease both;
          animation-delay: 0.15s;
        }
        .hero-number-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00d4ff, #3b82f6, #a855f7);
        }
        .hero-number-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(0,212,255,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .hero-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
        }
        .hero-value {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #00d4ff 0%, #3b82f6 40%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: pulseGlow 3s ease-in-out infinite;
          line-height: 1.1;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }
        .hero-annual {
          font-size: 1.1rem;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          position: relative;
          z-index: 1;
        }
        .hero-annual strong {
          color: #10b981;
          font-weight: 700;
        }

        /* -------- Revenue Breakdown Table -------- */
        .breakdown-card {
          animation: fadeInUp 0.6s ease both;
          animation-delay: 0.25s;
        }
        .breakdown-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .breakdown-table {
          width: 100%;
          border-collapse: collapse;
        }
        .breakdown-table th {
          text-align: left;
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0 0 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .breakdown-table th:last-child {
          text-align: right;
        }
        .breakdown-table td {
          padding: 0.85rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .breakdown-row {
          transition: background 0.2s ease;
        }
        .breakdown-row:hover {
          background: rgba(255,255,255,0.02);
        }
        .breakdown-source {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .breakdown-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          flex-shrink: 0;
        }
        .breakdown-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
        }
        .breakdown-assumption {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.35);
          margin-top: 2px;
        }
        .breakdown-bar-cell {
          width: 120px;
          padding-right: 1rem !important;
        }
        .breakdown-bar-track {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          overflow: hidden;
        }
        .breakdown-bar-fill {
          height: 100%;
          border-radius: 100px;
          animation: progressFill 1s ease both;
          transition: width 0.5s ease;
        }
        .breakdown-amount {
          text-align: right;
          font-size: 0.92rem;
          font-weight: 700;
          color: #fff;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .breakdown-total-row td {
          border-top: 2px solid rgba(0,212,255,0.2);
          border-bottom: none;
          padding-top: 1rem;
        }
        .breakdown-total-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: #00d4ff;
        }
        .breakdown-total-amount {
          text-align: right;
          font-size: 1.15rem;
          font-weight: 800;
          background: linear-gradient(135deg, #00d4ff, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-variant-numeric: tabular-nums;
        }

        /* -------- ROI Comparison -------- */
        .roi-comparison-card {
          animation: fadeInUp 0.6s ease both;
          animation-delay: 0.35s;
        }
        .roi-comp-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .roi-comp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .roi-comp-item {
          text-align: center;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .roi-comp-item-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .roi-comp-item-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .roi-comp-item-value--accent {
          color: #00d4ff;
        }
        .roi-comp-item-value--success {
          color: #10b981;
        }
        .roi-visual-bar {
          position: relative;
          height: 40px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255,255,255,0.04);
        }
        .roi-visual-investment {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          background: linear-gradient(90deg, rgba(239,68,68,0.3), rgba(239,68,68,0.15));
          border-right: 2px solid rgba(239,68,68,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          transition: width 0.5s ease;
          min-width: 60px;
        }
        .roi-visual-return {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          background: linear-gradient(90deg, rgba(0,212,255,0.15), rgba(16,185,129,0.25));
          display: flex;
          align-items: center;
          padding-left: 0.75rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #10b981;
          border-radius: 12px;
          animation: roiBarGrow 1s ease both;
          transform-origin: left;
          transition: width 0.5s ease;
        }
        .roi-visual-return-label {
          position: absolute;
          right: 0.75rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
        }

        /* -------- Before / After -------- */
        .ba-card {
          animation: fadeInUp 0.6s ease both;
          animation-delay: 0.4s;
        }
        .ba-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ba-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .ba-col {
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid;
        }
        .ba-col--before {
          background: rgba(239,68,68,0.05);
          border-color: rgba(239,68,68,0.15);
        }
        .ba-col--after {
          background: rgba(16,185,129,0.05);
          border-color: rgba(16,185,129,0.15);
        }
        .ba-col-header {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .ba-col--before .ba-col-header { color: #ef4444; }
        .ba-col--after .ba-col-header { color: #10b981; }
        .ba-metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.55rem 0;
          font-size: 0.82rem;
        }
        .ba-metric + .ba-metric {
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .ba-metric-label {
          color: rgba(255,255,255,0.5);
          font-weight: 500;
        }
        .ba-metric-value {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        .ba-col--before .ba-metric-value { color: rgba(255,255,255,0.5); }
        .ba-col--after .ba-metric-value { color: #10b981; }

        /* -------- CTA Section -------- */
        .roi-cta {
          text-align: center;
          margin-top: 2rem;
          padding: 2.5rem 2rem;
          animation: fadeInUp 0.6s ease both;
          animation-delay: 0.5s;
          position: relative;
          overflow: hidden;
        }
        .roi-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .roi-cta h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.5rem;
          position: relative;
          z-index: 1;
        }
        .roi-cta p {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.45);
          margin: 0 0 1.5rem;
          position: relative;
          z-index: 1;
        }
        .roi-cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .roi-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 2rem;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .roi-btn--primary {
          background: linear-gradient(135deg, #00d4ff, #3b82f6);
          color: #fff;
          box-shadow: 0 4px 24px rgba(0,212,255,0.3);
          font-size: 1.05rem;
          padding: 1rem 2.5rem;
        }
        .roi-btn--primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 36px rgba(0,212,255,0.45);
        }
        .roi-btn--secondary {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .roi-btn--secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }

        /* -------- Input Prefix -------- */
        .input-with-prefix {
          position: relative;
        }
        .input-prefix {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.35);
          font-size: 0.88rem;
          font-weight: 600;
          pointer-events: none;
        }
        .input-with-prefix .roi-input {
          padding-left: 1.8rem;
        }

        /* -------- Divider -------- */
        .roi-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin: 0.75rem 0;
        }

        /* -------- Responsive -------- */
        @media (max-width: 1100px) {
          .roi-layout {
            grid-template-columns: 1fr;
          }
          .input-panel {
            position: static;
          }
          .hero-value {
            font-size: 2.5rem;
          }
          .roi-comp-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
        @media (max-width: 768px) {
          .roi-header h1 {
            font-size: 1.65rem;
          }
          .hero-value {
            font-size: 2rem;
          }
          .roi-comp-grid {
            grid-template-columns: 1fr;
          }
          .ba-grid {
            grid-template-columns: 1fr;
          }
          .breakdown-bar-cell {
            display: none;
          }
          .roi-cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          .roi-btn--primary {
            width: 100%;
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .roi-header h1 {
            font-size: 1.4rem;
          }
          .hero-value {
            font-size: 1.75rem;
          }
          .hero-number-card {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>

      <div className={`roi-page ${visible ? 'roi-page--visible' : ''}`}>
        {/* =============== 1. Page Header =============== */}
        <header className="roi-header">
          <h1>Revenue Recovery Calculator</h1>
          <p>
            See exactly how much revenue your HVAC business is leaving on the
            table
          </p>
        </header>

        {/* =============== Main Layout =============== */}
        <div className="roi-layout">
          {/* ---------- INPUT PANEL ---------- */}
          <div className="input-panel roi-glass">
            <div className="input-panel-title">
              <span>⚙️</span> Your Business Details
            </div>
            <div className="input-panel-subtitle">
              Adjust the sliders to match your business
            </div>

            {/* Annual Revenue */}
            <div className="roi-form-group">
              <label className="roi-label">
                <span>Annual Revenue</span>
                <span className="roi-label-value">{fmtCompact(annualRevenue)}</span>
              </label>
              <input
                type="range"
                className="roi-slider"
                min={500000}
                max={20000000}
                step={100000}
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #00d4ff ${((annualRevenue - 500000) / 19500000) * 100}%, rgba(255,255,255,0.08) ${((annualRevenue - 500000) / 19500000) * 100}%)`,
                }}
              />
            </div>

            {/* Database Size */}
            <div className="roi-form-group">
              <label className="roi-label">
                <span>Database Size</span>
                <span className="roi-label-value">{fmt(databaseSize)} contacts</span>
              </label>
              <input
                type="range"
                className="roi-slider"
                min={200}
                max={5000}
                step={50}
                value={databaseSize}
                onChange={(e) => setDatabaseSize(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #00d4ff ${((databaseSize - 200) / 4800) * 100}%, rgba(255,255,255,0.08) ${((databaseSize - 200) / 4800) * 100}%)`,
                }}
              />
            </div>

            {/* Avg Service Ticket */}
            <div className="roi-form-group">
              <label className="roi-label">
                <span>Avg Service Ticket</span>
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  className="roi-input"
                  value={avgServiceTicket}
                  onChange={(e) =>
                    setAvgServiceTicket(Math.max(0, Number(e.target.value)))
                  }
                  min={0}
                />
              </div>
            </div>

            {/* Avg Install Ticket */}
            <div className="roi-form-group">
              <label className="roi-label">
                <span>Avg Install Ticket</span>
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  className="roi-input"
                  value={avgInstallTicket}
                  onChange={(e) =>
                    setAvgInstallTicket(Math.max(0, Number(e.target.value)))
                  }
                  min={0}
                />
              </div>
            </div>

            <div className="roi-divider" />

            {/* Follow-Up Rate */}
            <div className="roi-form-group">
              <label className="roi-label">
                <span>Current Follow-Up Rate</span>
                <span className="roi-label-value">{followUpRate}%</span>
              </label>
              <input
                type="range"
                className="roi-slider"
                min={0}
                max={100}
                step={1}
                value={followUpRate}
                onChange={(e) => setFollowUpRate(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #00d4ff ${followUpRate}%, rgba(255,255,255,0.08) ${followUpRate}%)`,
                }}
              />
            </div>

            {/* Google Reviews */}
            <div className="roi-form-group">
              <label className="roi-label">
                <span>Current Google Reviews</span>
              </label>
              <input
                type="number"
                className="roi-input"
                value={googleReviews}
                onChange={(e) =>
                  setGoogleReviews(Math.max(0, Number(e.target.value)))
                }
                min={0}
              />
            </div>

            {/* Monthly Inbound Calls */}
            <div className="roi-form-group">
              <label className="roi-label">
                <span>Monthly Inbound Calls</span>
              </label>
              <input
                type="number"
                className="roi-input"
                value={monthlyInboundCalls}
                onChange={(e) =>
                  setMonthlyInboundCalls(Math.max(0, Number(e.target.value)))
                }
                min={0}
              />
            </div>

            <div className="roi-divider" />

            {/* Membership Toggle */}
            <div className="roi-form-group">
              <div className="roi-toggle-row">
                <label className="roi-label" style={{ marginBottom: 0 }}>
                  <span>Membership Program</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="roi-toggle-labels">
                    <span className={!hasMembership ? 'active' : ''}>No</span>
                  </div>
                  <div
                    className={`roi-toggle ${hasMembership ? 'roi-toggle--active' : ''}`}
                    onClick={() => setHasMembership(!hasMembership)}
                    role="switch"
                    aria-checked={hasMembership}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setHasMembership(!hasMembership);
                      }
                    }}
                  />
                  <div className="roi-toggle-labels">
                    <span className={hasMembership ? 'active' : ''}>Yes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- RESULTS PANEL ---------- */}
          <div className="results-panel">
            {/* ---- a. Hero Number ---- */}
            <div className="roi-glass hero-number-card">
              <div className="hero-label">Estimated Monthly Recovery</div>
              <div className="hero-value">
                {fmtDollar(calculations.totalMonthly)}/mo
              </div>
              <div className="hero-annual">
                Annual Impact:{' '}
                <strong>{fmtDollar(calculations.totalAnnual)}</strong>
              </div>
            </div>

            {/* ---- b. Revenue Breakdown Table ---- */}
            <div className="roi-glass breakdown-card">
              <div className="breakdown-title">
                <span>📊</span> Revenue Breakdown
              </div>
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th className="breakdown-bar-cell">Impact</th>
                    <th style={{ textAlign: 'right' }}>Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.rows.map((row, i) => {
                    const pct =
                      calculations.maxRow > 0
                        ? (row.monthly / calculations.maxRow) * 100
                        : 0;
                    return (
                      <tr key={row.name} className="breakdown-row">
                        <td>
                          <div className="breakdown-source">
                            <div
                              className="breakdown-icon"
                              style={{ background: `${row.color}18` }}
                            >
                              {row.icon}
                            </div>
                            <div>
                              <div className="breakdown-name">{row.name}</div>
                              <div className="breakdown-assumption">
                                {row.assumption}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="breakdown-bar-cell">
                          <div className="breakdown-bar-track">
                            <div
                              className="breakdown-bar-fill"
                              style={{
                                width: `${pct}%`,
                                background: `linear-gradient(90deg, ${row.color}, ${row.color}88)`,
                                animationDelay: `${0.3 + i * 0.08}s`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="breakdown-amount">
                          {fmtDollar(row.monthly)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="breakdown-total-row">
                    <td className="breakdown-total-label">
                      Total Monthly Recovery
                    </td>
                    <td className="breakdown-bar-cell" />
                    <td className="breakdown-total-amount">
                      {fmtDollar(calculations.totalMonthly)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ---- c. ROI Comparison ---- */}
            <div className="roi-glass roi-comparison-card">
              <div className="roi-comp-title">
                <span>💎</span> Return on Investment
              </div>
              <div className="roi-comp-grid">
                <div className="roi-comp-item">
                  <div className="roi-comp-item-label">Your Investment</div>
                  <div className="roi-comp-item-value">
                    $1,797<span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>/mo</span>
                  </div>
                </div>
                <div className="roi-comp-item">
                  <div className="roi-comp-item-label">Projected Return</div>
                  <div className="roi-comp-item-value roi-comp-item-value--accent">
                    {fmtDollar(calculations.totalMonthly)}
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>/mo</span>
                  </div>
                </div>
                <div className="roi-comp-item">
                  <div className="roi-comp-item-label">ROI Multiple</div>
                  <div className="roi-comp-item-value roi-comp-item-value--success">
                    {calculations.roi.toFixed(1)}:1
                  </div>
                </div>
              </div>

              {/* Visual ROI Bar */}
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>Investment vs. Return</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>Growth Plan</span>
                </div>
                <div className="roi-visual-bar">
                  <div
                    className="roi-visual-return"
                    style={{ width: '100%' }}
                  >
                    <span>Return: {fmtDollar(calculations.totalMonthly)}</span>
                    <span className="roi-visual-return-label">
                      {calculations.roi.toFixed(1)}× your investment
                    </span>
                  </div>
                  <div
                    className="roi-visual-investment"
                    style={{
                      width: `${Math.min(95, Math.max(5, (calculations.investment / calculations.totalMonthly) * 100))}%`,
                    }}
                  >
                    $1,797
                  </div>
                </div>
              </div>
            </div>

            {/* ---- d. Before / After ---- */}
            <div className="roi-glass ba-card">
              <div className="ba-title">
                <span>🔄</span> Before vs. After
              </div>
              <div className="ba-grid">
                {/* Before */}
                <div className="ba-col ba-col--before">
                  <div className="ba-col-header">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4.5 9.5L9.5 4.5M4.5 4.5L9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Before
                  </div>
                  <div className="ba-metric">
                    <span className="ba-metric-label">Follow-up rate</span>
                    <span className="ba-metric-value">{followUpRate}%</span>
                  </div>
                  <div className="ba-metric">
                    <span className="ba-metric-label">Google reviews</span>
                    <span className="ba-metric-value">{googleReviews}</span>
                  </div>
                  <div className="ba-metric">
                    <span className="ba-metric-label">Missed calls recovered</span>
                    <span className="ba-metric-value">&lt;10%</span>
                  </div>
                  <div className="ba-metric">
                    <span className="ba-metric-label">Monthly recurring rev</span>
                    <span className="ba-metric-value">$0</span>
                  </div>
                </div>
                {/* After */}
                <div className="ba-col ba-col--after">
                  <div className="ba-col-header">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4.5 7L6 8.5L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    After
                  </div>
                  <div className="ba-metric">
                    <span className="ba-metric-label">Follow-up rate</span>
                    <span className="ba-metric-value">100% (automated)</span>
                  </div>
                  <div className="ba-metric">
                    <span className="ba-metric-label">Google reviews</span>
                    <span className="ba-metric-value">
                      {googleReviews + calculations.projectedReviewGain}
                      <span style={{ fontSize: '0.72rem', color: '#10b981', marginLeft: 4 }}>
                        +{calculations.projectedReviewGain}
                      </span>
                    </span>
                  </div>
                  <div className="ba-metric">
                    <span className="ba-metric-label">Missed calls recovered</span>
                    <span className="ba-metric-value">78%</span>
                  </div>
                  <div className="ba-metric">
                    <span className="ba-metric-label">Monthly recurring rev</span>
                    <span className="ba-metric-value">
                      {fmtDollar(calculations.projectedMRR)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =============== CTA Section =============== */}
        <div className="roi-glass roi-cta">
          <h3>Ready to Recover {fmtDollar(calculations.totalMonthly)} Every Month?</h3>
          <p>
            Join 200+ HVAC companies already using automated revenue recovery
          </p>
          <div className="roi-cta-buttons">
            <button className="roi-btn roi-btn--primary">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 7h14M6 11h2M10 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Schedule Your Free Database Audit
            </button>
            <button className="roi-btn roi-btn--secondary">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2v8m0 0l-3-3m3 3l3-3M3 12v3a1 1 0 001 1h10a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download This Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
