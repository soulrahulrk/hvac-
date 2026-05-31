'use client';

import { useState, useCallback } from 'react';
import './simulator.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface LogEntry {
  id: string;
  timestamp: Date;
  icon: string;
  description: string;
  status: 'success' | 'pending' | 'info';
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const AI_RESPONSES: Record<string, string> = {
  price:
    "Thank you for your interest! Our pricing varies based on the specific service needed. I'd love to schedule a free in-home estimate — would tomorrow between 10 AM and 2 PM work for you?",
  schedule:
    "Absolutely! I can get you scheduled right away. We have availability this week on Wednesday and Thursday. Which day works better for you, and do you prefer morning or afternoon?",
  emergency:
    "I understand this is urgent! Let me connect you with our emergency dispatch team right away. A technician can be at your location within 60-90 minutes. Can you confirm your address?",
  default:
    "Thanks for reaching out! We'd be happy to help. One of our HVAC specialists will review your message and get back to you within 15 minutes. Is there anything specific you'd like us to prioritize?",
};

function pickAIResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much'))
    return AI_RESPONSES.price;
  if (lower.includes('schedule') || lower.includes('appointment') || lower.includes('book'))
    return AI_RESPONSES.schedule;
  if (lower.includes('emergency') || lower.includes('broken') || lower.includes('not working'))
    return AI_RESPONSES.emergency;
  return AI_RESPONSES.default;
}

/* ------------------------------------------------------------------ */
/*  Initial seed data                                                  */
/* ------------------------------------------------------------------ */
const SEED_LOGS: LogEntry[] = [
  {
    id: uid(),
    timestamp: new Date(Date.now() - 300_000),
    icon: '📞',
    description:
      'Missed call from (555) 123-4567 — Auto text-back sent: "Hi! We noticed we missed your call. How can we help you today?"',
    status: 'success',
  },
  {
    id: uid(),
    timestamp: new Date(Date.now() - 600_000),
    icon: '📋',
    description:
      'Estimate #4521 sent to John Smith — $3,200 for AC Installation — Follow-up scheduled in 48hrs',
    status: 'success',
  },
  {
    id: uid(),
    timestamp: new Date(Date.now() - 900_000),
    icon: '💬',
    description:
      "Sarah Johnson replied to Reactivation Campaign: \"Yes, I'd like to schedule a tune-up\"",
    status: 'info',
  },
  {
    id: uid(),
    timestamp: new Date(Date.now() - 1_200_000),
    icon: '⭐',
    description:
      'Mike Davis left a 5-star Google review — Thank you response sent',
    status: 'success',
  },
  {
    id: uid(),
    timestamp: new Date(Date.now() - 1_500_000),
    icon: '🤖',
    description:
      'AI auto-response generated for incoming SMS from (555) 987-6543',
    status: 'info',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function SimulatorPage() {
  /* --------------- shared state --------------- */
  const [logs, setLogs] = useState<LogEntry[]>(SEED_LOGS);
  const [totalSims, setTotalSims] = useState(5);
  const [totalMsgs, setTotalMsgs] = useState(7);
  const [estRevenue, setEstRevenue] = useState(14_800);

  const addLog = useCallback(
    (icon: string, description: string, status: LogEntry['status'] = 'success') => {
      setLogs((prev) => [
        { id: uid(), timestamp: new Date(), icon, description, status },
        ...prev,
      ]);
      setTotalSims((n) => n + 1);
      setTotalMsgs((n) => n + Math.floor(Math.random() * 3) + 1);
      setEstRevenue((n) => n + Math.floor(Math.random() * 2000) + 500);
    },
    [],
  );

  /* --------------- card-specific state --------------- */
  // Missed Call
  const [mcPhone, setMcPhone] = useState('(555) 234-5678');
  const [mcName, setMcName] = useState('Robert Williams');

  // Estimate
  const [estName, setEstName] = useState('Emily Carter');
  const [estAmount, setEstAmount] = useState('4500');
  const [estService, setEstService] = useState('AC Repair');

  // Customer Reply
  const [crName, setCrName] = useState('David Martinez');
  const [crCampaign, setCrCampaign] = useState('Reactivation');
  const [crMessage, setCrMessage] = useState('');

  // Review
  const [revName, setRevName] = useState('Lisa Thompson');
  const [revRating, setRevRating] = useState(5);

  // Bulk
  const [bulkCount, setBulkCount] = useState(25);
  const [bulkTemplate, setBulkTemplate] = useState('seasonal-tuneup');

  // AI Response
  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  /* --------------- handlers --------------- */
  const handleMissedCall = () => {
    addLog(
      '📞',
      `Missed call from ${mcPhone} (${mcName}) — Auto text-back sent: "Hi ${mcName.split(' ')[0]}! We noticed we missed your call. How can we help you today?"`,
    );
  };

  const handleEstimate = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    addLog(
      '📋',
      `Estimate #${num} sent to ${estName} — $${Number(estAmount).toLocaleString()} for ${estService} — Follow-up scheduled in 48hrs`,
    );
  };

  const handleReply = () => {
    addLog(
      '💬',
      `${crName} replied to ${crCampaign} Campaign: "${crMessage || 'I\'m interested, please call me.'}"`,
      'info',
    );
  };

  const handleReview = () => {
    const stars = '⭐'.repeat(revRating);
    addLog(
      '⭐',
      `${revName} left a ${revRating}-star Google review ${stars} — ${revRating >= 4 ? 'Thank you response sent' : 'Internal alert triggered for follow-up'}`,
      revRating >= 4 ? 'success' : 'pending',
    );
  };

  const handleBulk = () => {
    const templateLabel =
      bulkTemplate === 'seasonal-tuneup'
        ? 'Seasonal Tune-Up'
        : bulkTemplate === 'maintenance-reminder'
          ? 'Maintenance Reminder'
          : bulkTemplate === 'upgrade-offer'
            ? 'Upgrade Offer'
            : 'Re-engagement';
    addLog(
      '🔄',
      `Bulk Reactivation started — ${bulkCount} contacts targeted with "${templateLabel}" template — Estimated delivery: 15 min`,
      'pending',
    );
  };

  const handleAI = () => {
    if (!aiInput.trim()) return;
    setAiTyping(true);
    setAiOutput('');
    setTimeout(() => {
      const response = pickAIResponse(aiInput);
      setAiOutput(response);
      setAiTyping(false);
      addLog(
        '🤖',
        `AI response generated for message: "${aiInput.slice(0, 50)}${aiInput.length > 50 ? '...' : ''}"`,
        'info',
      );
    }, 1200);
  };

  /* --------------- render --------------- */
  return (
    <div className="sim-page">
      {/* ---- Header ---- */}
      <section className="sim-header">
        <div className="sim-header-text">
          <h1 className="sim-title">System Simulator</h1>
          <p className="sim-subtitle">
            Test your automation workflows without using real API credits
          </p>
        </div>
      </section>

      {/* ---- Info Banner ---- */}
      <div className="sim-banner">
        <span className="sim-banner-icon">ℹ️</span>
        <span className="sim-banner-text">
          <strong>Simulator Mode</strong> — All actions below are simulated. No
          real messages will be sent.
        </span>
      </div>

      {/* ---- Simulation Cards Grid ---- */}
      <div className="sim-grid">
        {/* Card 1 – Missed Call */}
        <div className="sim-card">
          <div className="sim-card-header">
            <span className="sim-card-icon">📞</span>
            <h3 className="sim-card-title">Missed Call Simulator</h3>
          </div>
          <p className="sim-card-desc">
            Simulate an inbound call that goes unanswered
          </p>
          <div className="sim-field">
            <label>Customer Phone</label>
            <input
              type="text"
              value={mcPhone}
              onChange={(e) => setMcPhone(e.target.value)}
            />
          </div>
          <div className="sim-field">
            <label>Customer Name</label>
            <input
              type="text"
              value={mcName}
              onChange={(e) => setMcName(e.target.value)}
            />
          </div>
          <button className="sim-btn sim-btn--primary" onClick={handleMissedCall}>
            Simulate Missed Call
          </button>
        </div>

        {/* Card 2 – Estimate */}
        <div className="sim-card">
          <div className="sim-card-header">
            <span className="sim-card-icon">📋</span>
            <h3 className="sim-card-title">Estimate Sent Simulator</h3>
          </div>
          <p className="sim-card-desc">
            Simulate sending an estimate to a customer
          </p>
          <div className="sim-field">
            <label>Customer Name</label>
            <input
              type="text"
              value={estName}
              onChange={(e) => setEstName(e.target.value)}
            />
          </div>
          <div className="sim-field">
            <label>Estimate Amount ($)</label>
            <input
              type="number"
              value={estAmount}
              onChange={(e) => setEstAmount(e.target.value)}
            />
          </div>
          <div className="sim-field">
            <label>Service Type</label>
            <select value={estService} onChange={(e) => setEstService(e.target.value)}>
              <option>AC Repair</option>
              <option>AC Install</option>
              <option>Furnace Repair</option>
              <option>Furnace Install</option>
              <option>Heat Pump</option>
              <option>Duct Cleaning</option>
              <option>Maintenance Plan</option>
            </select>
          </div>
          <button className="sim-btn sim-btn--primary" onClick={handleEstimate}>
            Simulate Estimate
          </button>
        </div>

        {/* Card 3 – Customer Reply */}
        <div className="sim-card">
          <div className="sim-card-header">
            <span className="sim-card-icon">💬</span>
            <h3 className="sim-card-title">Customer Reply Simulator</h3>
          </div>
          <p className="sim-card-desc">
            Simulate a customer responding to your campaign
          </p>
          <div className="sim-field">
            <label>Customer Name</label>
            <input
              type="text"
              value={crName}
              onChange={(e) => setCrName(e.target.value)}
            />
          </div>
          <div className="sim-field">
            <label>Campaign Type</label>
            <select value={crCampaign} onChange={(e) => setCrCampaign(e.target.value)}>
              <option>Reactivation</option>
              <option>Seasonal Promo</option>
              <option>Maintenance Reminder</option>
              <option>Referral</option>
              <option>Post-Service Follow-Up</option>
            </select>
          </div>
          <div className="sim-field">
            <label>Customer&apos;s Reply Message</label>
            <textarea
              rows={3}
              placeholder="Type the customer's reply..."
              value={crMessage}
              onChange={(e) => setCrMessage(e.target.value)}
            />
          </div>
          <button className="sim-btn sim-btn--primary" onClick={handleReply}>
            Simulate Reply
          </button>
        </div>

        {/* Card 4 – Review */}
        <div className="sim-card">
          <div className="sim-card-header">
            <span className="sim-card-icon">⭐</span>
            <h3 className="sim-card-title">Review Request Simulator</h3>
          </div>
          <p className="sim-card-desc">
            Simulate the review collection workflow
          </p>
          <div className="sim-field">
            <label>Customer Name</label>
            <input
              type="text"
              value={revName}
              onChange={(e) => setRevName(e.target.value)}
            />
          </div>
          <div className="sim-field">
            <label>Rating</label>
            <div className="sim-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`sim-star ${star <= revRating ? 'sim-star--active' : ''}`}
                  onClick={() => setRevRating(star)}
                  type="button"
                >
                  ★
                </button>
              ))}
              <span className="sim-star-label">{revRating} / 5</span>
            </div>
          </div>
          <button className="sim-btn sim-btn--primary" onClick={handleReview}>
            Simulate Review
          </button>
        </div>

        {/* Card 5 – Bulk Reactivation */}
        <div className="sim-card">
          <div className="sim-card-header">
            <span className="sim-card-icon">🔄</span>
            <h3 className="sim-card-title">Bulk Reactivation Simulator</h3>
          </div>
          <p className="sim-card-desc">
            Simulate running a reactivation campaign on dormant leads
          </p>
          <div className="sim-field">
            <label>
              Contacts to Target: <strong>{bulkCount}</strong>
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={bulkCount}
              onChange={(e) => setBulkCount(Number(e.target.value))}
              className="sim-slider"
            />
            <div className="sim-slider-labels">
              <span>10</span>
              <span>100</span>
            </div>
          </div>
          <div className="sim-field">
            <label>Message Template</label>
            <select
              value={bulkTemplate}
              onChange={(e) => setBulkTemplate(e.target.value)}
            >
              <option value="seasonal-tuneup">Seasonal Tune-Up</option>
              <option value="maintenance-reminder">Maintenance Reminder</option>
              <option value="upgrade-offer">Upgrade Offer</option>
              <option value="re-engagement">Re-engagement</option>
            </select>
          </div>
          <button className="sim-btn sim-btn--primary" onClick={handleBulk}>
            Run Simulation
          </button>
        </div>

        {/* Card 6 – AI Response */}
        <div className="sim-card">
          <div className="sim-card-header">
            <span className="sim-card-icon">📱</span>
            <h3 className="sim-card-title">AI Response Simulator</h3>
          </div>
          <p className="sim-card-desc">
            Test how the AI would respond to customer messages
          </p>
          <div className="sim-field">
            <label>Customer Message</label>
            <textarea
              rows={3}
              placeholder="e.g. How much does an AC repair cost?"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
          </div>
          <button
            className="sim-btn sim-btn--primary"
            onClick={handleAI}
            disabled={aiTyping}
          >
            {aiTyping ? 'Generating...' : 'Generate AI Response'}
          </button>
          {(aiOutput || aiTyping) && (
            <div className="sim-ai-output">
              <span className="sim-ai-label">🤖 AI Response</span>
              {aiTyping ? (
                <span className="sim-ai-typing">
                  <span className="sim-dot" />
                  <span className="sim-dot" />
                  <span className="sim-dot" />
                </span>
              ) : (
                <p>{aiOutput}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- Simulation Activity Log ---- */}
      <div className="sim-log-card">
        <div className="sim-log-header">
          <h2 className="sim-log-title">Simulation Log</h2>
          <span className="sim-log-count">{logs.length} events</span>
        </div>
        <div className="sim-log-list">
          {logs.map((entry) => (
            <div className="sim-log-entry" key={entry.id}>
              <span className="sim-log-icon">{entry.icon}</span>
              <div className="sim-log-body">
                <p className="sim-log-desc">{entry.description}</p>
                <span className="sim-log-time">{fmtTime(entry.timestamp)}</span>
              </div>
              <span className={`sim-badge sim-badge--${entry.status}`}>
                {entry.status === 'success'
                  ? 'Completed'
                  : entry.status === 'pending'
                    ? 'Pending'
                    : 'Info'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Results Summary ---- */}
      <div className="sim-stats-row">
        <div className="sim-stat-card">
          <span className="sim-stat-icon">🧪</span>
          <div>
            <p className="sim-stat-value">{totalSims}</p>
            <p className="sim-stat-label">Total Simulations Run</p>
          </div>
        </div>
        <div className="sim-stat-card">
          <span className="sim-stat-icon">✉️</span>
          <div>
            <p className="sim-stat-value">{totalMsgs}</p>
            <p className="sim-stat-label">Messages Generated</p>
          </div>
        </div>
        <div className="sim-stat-card">
          <span className="sim-stat-icon">💰</span>
          <div>
            <p className="sim-stat-value">
              ${estRevenue.toLocaleString()}
            </p>
            <p className="sim-stat-label">Estimated Revenue Impact</p>
          </div>
        </div>
      </div>
    </div>
  );
}
