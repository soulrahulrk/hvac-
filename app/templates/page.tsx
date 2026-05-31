'use client';

import { useState, useEffect } from 'react';

/* ─── Types ─── */
type Category = 'All' | 'Reactivation' | 'Follow-Up' | 'Maintenance' | 'Reviews' | 'Referrals' | 'Seasonal' | 'Membership';
type Channel = 'SMS' | 'Email';

interface Template {
  id: string;
  name: string;
  category: Exclude<Category, 'All'>;
  channel: Channel;
  subject?: string;
  body: string;
  responseRate: number;
  effectiveness: number;
  bestTime: string;
  recommendedSegment: string;
}

/* ─── Data ─── */
const CATEGORIES: Category[] = ['All', 'Reactivation', 'Follow-Up', 'Maintenance', 'Reviews', 'Referrals', 'Seasonal', 'Membership'];

const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, string> = {
  Reactivation: '#10b981',
  'Follow-Up': '#3b82f6',
  Maintenance: '#f59e0b',
  Reviews: '#a855f7',
  Referrals: '#ec4899',
  Seasonal: '#00d4ff',
  Membership: '#f97316',
};

const VARIABLES = ['{firstName}', '{companyName}', '{equipmentType}', '{serviceType}', '{phone}', '{estimateAmount}'];

const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Dormant Lead Reactivation',
    category: 'Reactivation',
    channel: 'SMS',
    body: "Hi {firstName}, this is {companyName}. We noticed it's been a while since your last service. We'd love to help keep your {equipmentType} running smoothly. Would you like to schedule a quick tune-up? Reply YES and we'll find a time that works!",
    responseRate: 34,
    effectiveness: 4.8,
    bestTime: 'Tue–Thu, 10am–2pm',
    recommendedSegment: 'Customers inactive 6+ months',
  },
  {
    id: 't2',
    name: 'Estimate Follow-Up — Day 1',
    category: 'Follow-Up',
    channel: 'SMS',
    body: "Hi {firstName}, thanks for getting an estimate with us! Just wanted to check in — do you have any questions about the {serviceType} quote we sent over? We're happy to walk through the details. Reply anytime!",
    responseRate: 42,
    effectiveness: 4.9,
    bestTime: 'Same day, 4–6pm',
    recommendedSegment: 'Leads with pending estimates',
  },
  {
    id: 't3',
    name: 'Estimate Follow-Up — Day 3 Urgency',
    category: 'Follow-Up',
    channel: 'SMS',
    body: "Hi {firstName}, quick heads up — we're booking up fast this month for {serviceType}. Your estimate of ${estimateAmount} is still valid. Want us to hold a spot for you? Just reply YES.",
    responseRate: 28,
    effectiveness: 4.5,
    bestTime: 'Wed–Fri, 9am–11am',
    recommendedSegment: 'Leads with 3-day old estimates',
  },
  {
    id: 't4',
    name: 'Pre-Season AC Tune-Up',
    category: 'Seasonal',
    channel: 'SMS',
    body: "Summer is coming, {firstName}! ☀️ Don't wait until your AC breaks down on the hottest day. Schedule your pre-season tune-up now and get $25 off. Reply SCHEDULE or call us at {phone}.",
    responseRate: 31,
    effectiveness: 4.6,
    bestTime: 'March–May, weekdays',
    recommendedSegment: 'All AC customers',
  },
  {
    id: 't5',
    name: '5-Star Review Request',
    category: 'Reviews',
    channel: 'SMS',
    body: "Hi {firstName}, thank you for choosing {companyName}! We hope you're happy with your recent {serviceType}. Would you mind leaving us a quick Google review? It really helps! {reviewLink}",
    responseRate: 38,
    effectiveness: 4.7,
    bestTime: '1–3 days after service',
    recommendedSegment: 'Recently serviced customers',
  },
  {
    id: 't6',
    name: 'Referral Ask',
    category: 'Referrals',
    channel: 'SMS',
    body: "Hi {firstName}! Know anyone who needs HVAC help? Refer a friend to {companyName} and you'll BOTH get $50 off your next service. Just share this link: {referralLink}",
    responseRate: 22,
    effectiveness: 4.3,
    bestTime: 'After positive review',
    recommendedSegment: '5-star reviewers',
  },
  {
    id: 't7',
    name: 'Maintenance Reminder',
    category: 'Maintenance',
    channel: 'SMS',
    body: "Hi {firstName}, it's been {monthsSinceService} months since your last {equipmentType} service. Regular maintenance extends equipment life by 5-10 years. Want to schedule? Reply YES!",
    responseRate: 29,
    effectiveness: 4.4,
    bestTime: 'Mon–Wed, 9am–12pm',
    recommendedSegment: 'Customers due for maintenance',
  },
  {
    id: 't8',
    name: 'Membership Renewal',
    category: 'Membership',
    channel: 'SMS',
    body: "Hi {firstName}, your {companyName} membership expires soon! Renew now to keep your priority scheduling, 15% parts discount, and free annual tune-ups. Reply RENEW or call {phone}.",
    responseRate: 45,
    effectiveness: 4.9,
    bestTime: '2 weeks before expiry',
    recommendedSegment: 'Expiring memberships',
  },
  {
    id: 't9',
    name: 'Missed Call Text-Back',
    category: 'Follow-Up',
    channel: 'SMS',
    body: "Hi! We missed your call at {companyName}. Sorry about that! How can we help you today? Reply here and we'll get right back to you, or call us back at {phone}.",
    responseRate: 52,
    effectiveness: 5.0,
    bestTime: 'Immediately after missed call',
    recommendedSegment: 'Missed inbound calls',
  },
  {
    id: 't10',
    name: 'Equipment Replacement Alert',
    category: 'Reactivation',
    channel: 'Email',
    subject: "{firstName}, your {equipmentType} is {equipmentAge} years old — here's what that means",
    body: "Most {equipmentType} units last 12-15 years. At {equipmentAge} years, repair costs increase 3x and energy efficiency drops significantly. We'd love to show you modern options that could cut your energy bills by 30-40%. Schedule a free consultation today.",
    responseRate: 18,
    effectiveness: 4.2,
    bestTime: 'Tue–Thu, 8am–10am',
    recommendedSegment: 'Equipment 10+ years old',
  },
  {
    id: 't11',
    name: 'Winter Furnace Check',
    category: 'Seasonal',
    channel: 'SMS',
    body: "Brrr! 🥶 Winter is around the corner, {firstName}. Is your furnace ready? Schedule a safety inspection before the cold hits. Reply HEAT to book!",
    responseRate: 33,
    effectiveness: 4.6,
    bestTime: 'Sep–Nov, weekdays',
    recommendedSegment: 'All furnace customers',
  },
  {
    id: 't12',
    name: 'Post-Service Thank You',
    category: 'Reviews',
    channel: 'SMS',
    body: "Thanks for trusting {companyName}, {firstName}! Your {serviceType} is all done. If you have any issues, call us anytime at {phone}. We'd also love a quick review if you have 30 seconds: {reviewLink}",
    responseRate: 41,
    effectiveness: 4.8,
    bestTime: 'Same day, 5–7pm',
    recommendedSegment: 'Just-completed services',
  },
];

/* ─── Component ─── */
export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<Category>('All');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* Create-template form state */
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Exclude<Category, 'All'>>('Reactivation');
  const [newChannel, setNewChannel] = useState<Channel>('SMS');
  const [newBody, setNewBody] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const filtered = activeTab === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.category === activeTab);

  const insertVariable = (v: string) => setNewBody((prev) => prev + v);

  const highlightVars = (text: string) =>
    text.replace(/\{[a-zA-Z]+\}/g, (m) => `<span class="tpl-var">${m}</span>`);

  const truncate = (text: string, len = 120) => (text.length > len ? text.slice(0, len) + '…' : text);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        /* ─── Tokens ─── */
        :root {
          --bg-deep: #0a0f1e;
          --bg-card: rgba(255,255,255,0.05);
          --bg-card-hover: rgba(255,255,255,0.08);
          --border: rgba(255,255,255,0.1);
          --border-focus: rgba(0,212,255,0.5);
          --cyan: #00d4ff;
          --blue: #3b82f6;
          --green: #10b981;
          --amber: #f59e0b;
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-tertiary: #64748b;
          --radius: 14px;
          --radius-sm: 8px;
          --glass-blur: blur(20px);
          --transition: 0.3s ease;
        }

        /* ─── Page ─── */
        .tpl-page {
          min-height: 100vh;
          background: var(--bg-deep);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--text-primary);
          padding: 32px 40px 60px;
        }
        @media (max-width: 768px) {
          .tpl-page { padding: 20px 16px 40px; }
        }

        /* ─── Header ─── */
        .tpl-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          gap: 20px;
          flex-wrap: wrap;
        }
        .tpl-header h1 {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 6px;
          background: linear-gradient(135deg, #fff 0%, var(--cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tpl-header p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 15px;
        }

        /* ─── Buttons ─── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, var(--cyan), var(--blue));
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
          font-family: inherit;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,212,255,0.35);
        }
        .btn-primary-sm {
          padding: 8px 18px;
          font-size: 13px;
          border-radius: 6px;
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          font-family: inherit;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
          border-color: rgba(255,255,255,0.2);
        }

        /* ─── Category Tabs ─── */
        .tpl-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 32px;
          overflow-x: auto;
          padding-bottom: 4px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .tpl-tabs::-webkit-scrollbar { display: none; }
        .tpl-tab {
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid var(--border);
          border-radius: 100px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
          font-family: inherit;
        }
        .tpl-tab:hover {
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
        }
        .tpl-tab.active {
          background: linear-gradient(135deg, var(--cyan), var(--blue));
          color: #fff;
          border-color: transparent;
        }

        /* ─── Grid ─── */
        .tpl-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1100px) { .tpl-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 680px)  { .tpl-grid { grid-template-columns: 1fr; } }

        /* ─── Card ─── */
        .tpl-card {
          background: var(--bg-card);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }
        .tpl-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--card-accent);
          opacity: 0;
          transition: var(--transition);
        }
        .tpl-card:hover {
          background: var(--bg-card-hover);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        }
        .tpl-card:hover::before { opacity: 1; }

        .tpl-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tpl-badge {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #fff;
        }
        .tpl-channel {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(255,255,255,0.08);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .tpl-card h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .tpl-preview-text {
          font-size: 13px;
          color: var(--text-tertiary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tpl-stats {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .tpl-stat {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .tpl-stat-highlight {
          color: var(--green);
          font-weight: 700;
        }
        .tpl-card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 4px;
        }
        .tpl-card-actions .btn-primary { flex: 1; justify-content: center; }

        /* ─── Modal Overlay ─── */
        .tpl-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .tpl-modal {
          background: #111827;
          border: 1px solid var(--border);
          border-radius: 20px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
          position: relative;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tpl-modal::-webkit-scrollbar { width: 6px; }
        .tpl-modal::-webkit-scrollbar-track { background: transparent; }
        .tpl-modal::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }

        .tpl-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.06);
          color: var(--text-secondary);
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          z-index: 10;
          font-family: inherit;
        }
        .tpl-modal-close:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
        }

        /* ─── Preview Modal ─── */
        .preview-modal { max-width: 900px; }
        .preview-modal-inner {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 0;
        }
        @media (max-width: 768px) {
          .preview-modal-inner { grid-template-columns: 1fr; }
        }
        .preview-left {
          padding: 40px;
          border-right: 1px solid var(--border);
        }
        @media (max-width: 768px) {
          .preview-left { border-right: none; border-bottom: 1px solid var(--border); padding: 28px 24px; }
        }
        .preview-left h2 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 6px;
        }
        .preview-left .preview-cat {
          margin-bottom: 24px;
        }

        /* Phone Mockup */
        .phone-mockup {
          width: 260px;
          margin: 0 auto 24px;
          background: #1a1f36;
          border-radius: 28px;
          border: 2px solid rgba(255,255,255,0.12);
          padding: 16px;
          position: relative;
        }
        .phone-notch {
          width: 80px;
          height: 6px;
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
          margin: 0 auto 16px;
        }
        .phone-bubble {
          background: var(--blue);
          border-radius: 16px 16px 4px 16px;
          padding: 14px 16px;
          font-size: 13px;
          line-height: 1.6;
          color: #fff;
        }
        .phone-bubble .tpl-var {
          background: rgba(0,212,255,0.25);
          color: var(--cyan);
          padding: 1px 4px;
          border-radius: 4px;
          font-weight: 600;
        }
        .phone-time {
          text-align: right;
          font-size: 11px;
          color: var(--text-tertiary);
          margin-top: 8px;
        }

        /* Full message text */
        .preview-full-text {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          font-size: 14px;
          line-height: 1.8;
          color: var(--text-secondary);
        }
        .preview-full-text .tpl-var {
          background: rgba(0,212,255,0.15);
          color: var(--cyan);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 13px;
        }

        /* Sidebar */
        .preview-right {
          padding: 40px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .preview-stat-block {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px;
        }
        .preview-stat-block label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.7px;
          margin-bottom: 6px;
        }
        .preview-stat-block .value {
          font-size: 26px;
          font-weight: 800;
          color: var(--green);
        }
        .preview-stat-block .value-sm {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .preview-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
        }
        .preview-actions .btn-primary { justify-content: center; }
        .preview-actions .btn-ghost  { justify-content: center; }

        /* ─── Create Modal ─── */
        .create-modal { max-width: 620px; }
        .create-modal-inner { padding: 40px; }
        @media (max-width: 640px) { .create-modal-inner { padding: 24px; } }
        .create-modal-inner h2 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 4px;
        }
        .create-modal-inner > p {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 0 0 28px;
        }
        .form-group {
          margin-bottom: 22px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
          transition: var(--transition);
          outline: none;
          box-sizing: border-box;
        }
        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.1);
        }
        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }
        .form-select option {
          background: #1a1f36;
          color: var(--text-primary);
        }
        .form-textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.6;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }

        .var-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }
        .var-btn {
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'SF Mono', 'Fira Code', monospace;
          background: rgba(0,212,255,0.1);
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 6px;
          color: var(--cyan);
          cursor: pointer;
          transition: var(--transition);
        }
        .var-btn:hover {
          background: rgba(0,212,255,0.2);
          border-color: var(--cyan);
        }
        .char-counter {
          text-align: right;
          font-size: 12px;
          margin-top: 6px;
          font-weight: 600;
        }
        .char-ok   { color: var(--text-tertiary); }
        .char-warn { color: var(--amber); }
        .char-over { color: #ef4444; }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        /* ─── Empty state ─── */
        .tpl-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: var(--text-tertiary);
          font-size: 15px;
        }
        .tpl-empty span {
          font-size: 40px;
          display: block;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="tpl-page">
        {/* ─── Header ─── */}
        <header className="tpl-header">
          <div>
            <h1>Message Templates</h1>
            <p>24 pre-built HVAC templates ready to deploy — proven to get responses</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
            Create Template
          </button>
        </header>

        {/* ─── Category Tabs ─── */}
        <div className="tpl-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tpl-tab${activeTab === cat ? ' active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ─── Grid ─── */}
        <div className="tpl-grid">
          {filtered.length === 0 && (
            <div className="tpl-empty">
              <span>📭</span>
              No templates in this category yet.
            </div>
          )}
          {filtered.map((tpl) => {
            const accent = CATEGORY_COLORS[tpl.category];
            return (
              <div key={tpl.id} className="tpl-card" style={{ '--card-accent': accent } as React.CSSProperties}>
                <div className="tpl-card-top">
                  <span className="tpl-badge" style={{ background: accent + '22', color: accent, border: `1px solid ${accent}44` }}>
                    {tpl.category}
                  </span>
                  <span className="tpl-channel">{tpl.channel === 'SMS' ? '💬 SMS' : '✉️ Email'}</span>
                </div>

                <h3>{tpl.name}</h3>

                <p className="tpl-preview-text">{truncate(tpl.body)}</p>

                <div className="tpl-stats">
                  <span className="tpl-stat">
                    📈 Avg <span className="tpl-stat-highlight" style={{ marginLeft: 4 }}>{tpl.responseRate}%</span>&nbsp;response rate
                  </span>
                  <span className="tpl-stat">⭐ {tpl.effectiveness}/5</span>
                </div>

                <div className="tpl-card-actions">
                  <button className="btn-primary btn-primary-sm" onClick={() => {}}>
                    Use Template
                  </button>
                  <button className="btn-ghost" onClick={() => setPreviewTemplate(tpl)}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                    Preview
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Preview Modal ─── */}
      {previewTemplate && (
        <div className="tpl-overlay" onClick={() => setPreviewTemplate(null)}>
          <div className="tpl-modal preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tpl-modal-close" onClick={() => setPreviewTemplate(null)}>✕</button>
            <div className="preview-modal-inner">
              <div className="preview-left">
                <div className="preview-cat">
                  <span
                    className="tpl-badge"
                    style={{
                      background: CATEGORY_COLORS[previewTemplate.category] + '22',
                      color: CATEGORY_COLORS[previewTemplate.category],
                      border: `1px solid ${CATEGORY_COLORS[previewTemplate.category]}44`,
                    }}
                  >
                    {previewTemplate.category}
                  </span>
                  <span className="tpl-channel" style={{ marginLeft: 8 }}>
                    {previewTemplate.channel === 'SMS' ? '💬 SMS' : '✉️ Email'}
                  </span>
                </div>
                <h2>{previewTemplate.name}</h2>

                {previewTemplate.subject && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '8px 0 20px' }}>
                    <strong style={{ color: 'var(--text-tertiary)' }}>Subject:</strong>{' '}
                    <span dangerouslySetInnerHTML={{ __html: highlightVars(previewTemplate.subject) }} />
                  </p>
                )}

                {/* Phone mockup */}
                {previewTemplate.channel === 'SMS' && (
                  <div className="phone-mockup">
                    <div className="phone-notch" />
                    <div className="phone-bubble" dangerouslySetInnerHTML={{ __html: highlightVars(previewTemplate.body) }} />
                    <div className="phone-time">Now</div>
                  </div>
                )}

                {/* Full text */}
                <div className="preview-full-text" dangerouslySetInnerHTML={{ __html: highlightVars(previewTemplate.body) }} />
              </div>

              <div className="preview-right">
                <div className="preview-stat-block">
                  <label>Response Rate</label>
                  <div className="value">{previewTemplate.responseRate}%</div>
                </div>
                <div className="preview-stat-block">
                  <label>Effectiveness</label>
                  <div className="value">⭐ {previewTemplate.effectiveness}/5</div>
                </div>
                <div className="preview-stat-block">
                  <label>Best Time to Send</label>
                  <div className="value-sm">{previewTemplate.bestTime}</div>
                </div>
                <div className="preview-stat-block">
                  <label>Recommended Segment</label>
                  <div className="value-sm">{previewTemplate.recommendedSegment}</div>
                </div>

                <div className="preview-actions">
                  <button className="btn-primary" onClick={() => setPreviewTemplate(null)}>
                    🚀 Use This Template
                  </button>
                  <button className="btn-ghost" onClick={() => setPreviewTemplate(null)}>
                    ✏️ Customize &amp; Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Modal ─── */}
      {showCreateModal && (
        <div className="tpl-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="tpl-modal create-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tpl-modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            <div className="create-modal-inner">
              <h2>Create New Template</h2>
              <p>Build a custom HVAC message template for your campaigns.</p>

              <div className="form-group">
                <label>Template Name</label>
                <input className="form-input" type="text" placeholder="e.g. Spring AC Promo" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value as Exclude<Category, 'All'>)}>
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Channel</label>
                  <select className="form-select" value={newChannel} onChange={(e) => setNewChannel(e.target.value as Channel)}>
                    <option value="SMS">💬 SMS</option>
                    <option value="Email">✉️ Email</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Message Body</label>
                <textarea
                  className="form-textarea"
                  placeholder="Type your template message here…"
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                />
                <div className="var-buttons">
                  {VARIABLES.map((v) => (
                    <button key={v} className="var-btn" type="button" onClick={() => insertVariable(v)}>
                      {v}
                    </button>
                  ))}
                </div>
                {newChannel === 'SMS' && (
                  <div className={`char-counter ${newBody.length <= 160 ? 'char-ok' : newBody.length <= 300 ? 'char-warn' : 'char-over'}`}>
                    {newBody.length} / 160 characters
                    {newBody.length > 160 && newBody.length <= 300 && ' (2 segments)'}
                    {newBody.length > 300 && ' (3+ segments)'}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button className="btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={() => { setShowCreateModal(false); setNewName(''); setNewBody(''); }}>
                  💾 Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
