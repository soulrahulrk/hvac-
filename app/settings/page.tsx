'use client';

import { useState } from 'react';

/* ────────────────────────────────────────────
   Toggle Switch  (iOS-style, pure CSS)
   ──────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="settings-toggle" data-disabled={disabled || undefined}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="settings-toggle-track">
        <span className="settings-toggle-thumb" />
      </span>
    </label>
  );
}

/* ────────────────────────────────────────────
   Main Settings Page
   ──────────────────────────────────────────── */
export default function SettingsPage() {
  /* ── Twilio ─────────────────────────────── */
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');
  const [showTwilioSid, setShowTwilioSid] = useState(false);
  const [showTwilioToken, setShowTwilioToken] = useState(false);

  /* ── AI Provider ────────────────────────── */
  const [aiProvider, setAiProvider] = useState('groq');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('llama-3-70b');
  const [showAiKey, setShowAiKey] = useState(false);

  /* ── Supabase ───────────────────────────── */
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);

  /* ── Business Profile ───────────────────── */
  const [companyName, setCompanyName] = useState('Cool Air HVAC Services');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [brandColor, setBrandColor] = useState('#00d4ff');

  /* ── Automation ─────────────────────────── */
  const [autoTextBack, setAutoTextBack] = useState(true);
  const [aiResponses, setAiResponses] = useState(false);
  const [autoReview, setAutoReview] = useState(true);
  const [followUpReminders, setFollowUpReminders] = useState(true);
  const [followUpDelay, setFollowUpDelay] = useState(48);
  const [maxMessages, setMaxMessages] = useState(3);

  /* ── Danger Zone confirmations ──────────── */
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  /* ── Model options per provider ─────────── */
  const modelOptions: Record<string, { value: string; label: string }[]> = {
    groq: [{ value: 'llama-3-70b', label: 'Llama 3 70B' }],
    gemini: [{ value: 'gemini-pro', label: 'Gemini Pro' }],
    openai: [{ value: 'gpt-4o', label: 'GPT-4o' }],
  };

  return (
    <>
      <style>{`
        /* ── Settings Layout ─────────────────────── */
        .settings-page {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 0 64px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .settings-header {
          margin-bottom: 8px;
        }
        .settings-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary, #fff);
          margin: 0 0 6px;
        }
        .settings-header p {
          color: var(--text-secondary, rgba(255,255,255,0.5));
          font-size: 0.95rem;
          margin: 0;
        }

        /* ── Glass Card ──────────────────────────── */
        .settings-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 28px 32px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .settings-card:hover {
          border-color: rgba(255,255,255,0.14);
        }
        .settings-card.danger {
          border-color: rgba(239,68,68,0.35);
        }
        .settings-card.danger:hover {
          border-color: rgba(239,68,68,0.55);
        }
        .settings-card-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary, #fff);
          margin: 0 0 4px;
        }
        .settings-card-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary, rgba(255,255,255,0.45));
          margin: 0 0 24px;
        }

        /* ── Integration Groups ──────────────────── */
        .integration-group {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 22px 24px;
          margin-bottom: 20px;
        }
        .integration-group:last-child {
          margin-bottom: 0;
        }
        .integration-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 18px;
        }
        .integration-group-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary, #fff);
          margin: 0;
        }

        /* ── Status Badges ───────────────────────── */
        .status-badge {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .status-badge.red {
          background: rgba(239,68,68,0.15);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.25);
        }
        .status-badge.green {
          background: rgba(16,185,129,0.15);
          color: #34d399;
          border: 1px solid rgba(16,185,129,0.25);
        }
        .status-badge.yellow {
          background: rgba(245,158,11,0.15);
          color: #fbbf24;
          border: 1px solid rgba(245,158,11,0.25);
        }

        /* ── Form Fields ─────────────────────────── */
        .settings-field {
          margin-bottom: 16px;
        }
        .settings-field:last-child {
          margin-bottom: 0;
        }
        .settings-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-secondary, rgba(255,255,255,0.6));
          margin-bottom: 6px;
          letter-spacing: 0.01em;
        }
        .settings-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .settings-input,
        .settings-select,
        .settings-textarea {
          width: 100%;
          padding: 10px 14px;
          font-size: 0.9rem;
          font-family: inherit;
          color: var(--text-primary, #fff);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .settings-input:focus,
        .settings-select:focus,
        .settings-textarea:focus {
          border-color: var(--accent-primary, #00d4ff);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.12);
        }
        .settings-input::placeholder,
        .settings-textarea::placeholder {
          color: rgba(255,255,255,0.25);
        }
        .settings-input.has-toggle {
          padding-right: 48px;
        }
        .settings-textarea {
          resize: vertical;
          min-height: 80px;
        }
        .settings-select {
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(255,255,255,0.5)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }
        .settings-select option {
          background: #1a1f36;
          color: #fff;
        }

        /* ── Visibility Toggle ───────────────────── */
        .settings-eye-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.05rem;
          padding: 4px;
          opacity: 0.5;
          transition: opacity 0.2s ease;
          line-height: 1;
        }
        .settings-eye-btn:hover {
          opacity: 0.9;
        }

        /* ── Buttons ─────────────────────────────── */
        .settings-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 20px;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: inherit;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          white-space: nowrap;
        }
        .settings-btn.primary {
          background: linear-gradient(135deg, var(--accent-primary, #00d4ff), #3b82f6);
          color: #fff;
          box-shadow: 0 4px 18px rgba(0,212,255,0.2);
        }
        .settings-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(0,212,255,0.35);
        }
        .settings-btn.ghost {
          background: transparent;
          color: var(--text-secondary, rgba(255,255,255,0.6));
          border: 1px solid rgba(255,255,255,0.1);
        }
        .settings-btn.ghost:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary, #fff);
          border-color: rgba(255,255,255,0.2);
        }
        .settings-btn.danger {
          background: rgba(239,68,68,0.12);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.25);
        }
        .settings-btn.danger:hover {
          background: rgba(239,68,68,0.22);
          border-color: rgba(239,68,68,0.4);
        }
        .settings-btn.lg {
          padding: 13px 36px;
          font-size: 0.95rem;
          border-radius: 12px;
        }
        .settings-btn.sm {
          padding: 7px 14px;
          font-size: 0.78rem;
        }

        /* ── Toggle (iOS-style) ──────────────────── */
        .settings-toggle {
          position: relative;
          display: inline-block;
          cursor: pointer;
          flex-shrink: 0;
        }
        .settings-toggle[data-disabled] {
          opacity: 0.45;
          pointer-events: none;
        }
        .settings-toggle input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .settings-toggle-track {
          display: block;
          width: 44px;
          height: 24px;
          border-radius: 999px;
          background: var(--bg-elevated, rgba(255,255,255,0.1));
          transition: background 0.3s ease;
          position: relative;
        }
        .settings-toggle input:checked + .settings-toggle-track {
          background: var(--accent-primary, #00d4ff);
        }
        .settings-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          transition: transform 0.3s ease;
        }
        .settings-toggle input:checked + .settings-toggle-track .settings-toggle-thumb {
          transform: translateX(20px);
        }

        /* ── Automation Row ──────────────────────── */
        .automation-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .automation-row:last-of-type {
          border-bottom: none;
        }
        .automation-row-info {
          flex: 1;
          min-width: 0;
        }
        .automation-row-label {
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--text-primary, #fff);
          margin: 0 0 2px;
        }
        .automation-row-note {
          font-size: 0.78rem;
          color: var(--text-secondary, rgba(255,255,255,0.4));
          margin: 0;
        }

        /* ── Inline Number Input ─────────────────── */
        .inline-number-field {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .inline-number-field:last-child {
          border-bottom: none;
        }
        .inline-number-field .automation-row-info {
          flex: 1;
        }
        .inline-number-input {
          width: 80px;
          padding: 8px 12px;
          font-size: 0.9rem;
          font-family: inherit;
          color: var(--text-primary, #fff);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          outline: none;
          text-align: center;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .inline-number-input:focus {
          border-color: var(--accent-primary, #00d4ff);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.12);
        }

        /* ── Logo Upload ─────────────────────────── */
        .logo-upload {
          border: 2px dashed rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.3s ease, background 0.3s ease;
        }
        .logo-upload:hover {
          border-color: var(--accent-primary, #00d4ff);
          background: rgba(0,212,255,0.04);
        }
        .logo-upload-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .logo-upload-text {
          font-size: 0.88rem;
          color: var(--text-secondary, rgba(255,255,255,0.5));
        }
        .logo-upload-hint {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          margin-top: 4px;
        }

        /* ── Color Picker ────────────────────────── */
        .color-picker-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .color-swatch-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 2px solid rgba(255,255,255,0.15);
          cursor: pointer;
          overflow: hidden;
          padding: 0;
          position: relative;
          flex-shrink: 0;
        }
        .color-swatch-btn input[type="color"] {
          position: absolute;
          inset: -8px;
          width: calc(100% + 16px);
          height: calc(100% + 16px);
          border: none;
          cursor: pointer;
          background: none;
        }
        .color-hex-display {
          font-size: 0.88rem;
          font-family: monospace;
          color: var(--text-secondary, rgba(255,255,255,0.6));
        }

        /* ── Danger Zone ─────────────────────────── */
        .danger-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(239,68,68,0.1);
          flex-wrap: wrap;
        }
        .danger-action:last-of-type {
          border-bottom: none;
        }
        .danger-action-info h4 {
          font-size: 0.92rem;
          font-weight: 500;
          color: #f87171;
          margin: 0 0 2px;
        }
        .danger-action-info p {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }
        .danger-confirm-text {
          font-size: 0.78rem;
          color: #fbbf24;
          margin-top: 8px;
          width: 100%;
        }

        /* ── Row of form inputs ──────────────────── */
        .settings-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ── Footer Buttons ──────────────────────── */
        .settings-footer {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: flex-end;
          padding-top: 8px;
        }

        /* ── Responsive ──────────────────────────── */
        @media (max-width: 640px) {
          .settings-card {
            padding: 20px 18px;
          }
          .integration-group {
            padding: 16px;
          }
          .settings-row {
            grid-template-columns: 1fr;
          }
          .settings-footer {
            flex-direction: column;
          }
          .settings-footer .settings-btn {
            width: 100%;
          }
          .danger-action {
            flex-direction: column;
            align-items: flex-start;
          }
          .integration-group-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="settings-page">
        {/* ── Page Header ─────────────────────────── */}
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Configure your API integrations and system preferences</p>
        </div>

        {/* ══════════════════════════════════════════
            1. API Configuration
           ══════════════════════════════════════════ */}
        <section className="settings-card">
          <h2 className="settings-card-title">🔑 API Keys &amp; Integrations</h2>
          <p className="settings-card-subtitle">
            Connect your service providers to enable live functionality
          </p>

          {/* ── Twilio ──────────────────────────────── */}
          <div className="integration-group">
            <div className="integration-group-header">
              <h3 className="integration-group-title">Twilio (SMS &amp; Voice)</h3>
              <span className={`status-badge ${twilioSid && twilioToken ? 'green' : 'red'}`}>
                {twilioSid && twilioToken ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <div className="settings-row">
              <div className="settings-field">
                <label className="settings-label">Account SID</label>
                <div className="settings-input-wrap">
                  <input
                    className="settings-input has-toggle"
                    type={showTwilioSid ? 'text' : 'password'}
                    placeholder="AC..."
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                  />
                  <button
                    type="button"
                    className="settings-eye-btn"
                    onClick={() => setShowTwilioSid(!showTwilioSid)}
                    aria-label="Toggle visibility"
                  >
                    {showTwilioSid ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-label">Auth Token</label>
                <div className="settings-input-wrap">
                  <input
                    className="settings-input has-toggle"
                    type={showTwilioToken ? 'text' : 'password'}
                    placeholder="••••••••••••••"
                    value={twilioToken}
                    onChange={(e) => setTwilioToken(e.target.value)}
                  />
                  <button
                    type="button"
                    className="settings-eye-btn"
                    onClick={() => setShowTwilioToken(!showTwilioToken)}
                    aria-label="Toggle visibility"
                  >
                    {showTwilioToken ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-field">
              <label className="settings-label">Phone Number</label>
              <input
                className="settings-input"
                type="text"
                placeholder="+1 (555) 000-0000"
                value={twilioPhone}
                onChange={(e) => setTwilioPhone(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="settings-btn ghost sm">Test Connection</button>
            </div>
          </div>

          {/* ── AI Provider ─────────────────────────── */}
          <div className="integration-group">
            <div className="integration-group-header">
              <h3 className="integration-group-title">AI Provider</h3>
              <span className={`status-badge ${aiApiKey ? 'green' : 'red'}`}>
                {aiApiKey ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <div className="settings-row">
              <div className="settings-field">
                <label className="settings-label">Provider</label>
                <select
                  className="settings-select"
                  value={aiProvider}
                  onChange={(e) => {
                    setAiProvider(e.target.value);
                    const models = modelOptions[e.target.value];
                    if (models?.[0]) setAiModel(models[0].value);
                  }}
                >
                  <option value="groq">Groq (Free)</option>
                  <option value="gemini">Google Gemini (Free)</option>
                  <option value="openai">OpenAI (Paid)</option>
                </select>
              </div>

              <div className="settings-field">
                <label className="settings-label">Model</label>
                <select
                  className="settings-select"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                >
                  {modelOptions[aiProvider]?.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="settings-field">
              <label className="settings-label">API Key</label>
              <div className="settings-input-wrap">
                <input
                  className="settings-input has-toggle"
                  type={showAiKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                />
                <button
                  type="button"
                  className="settings-eye-btn"
                  onClick={() => setShowAiKey(!showAiKey)}
                  aria-label="Toggle visibility"
                >
                  {showAiKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="settings-btn ghost sm">Test Connection</button>
            </div>
          </div>

          {/* ── Supabase ────────────────────────────── */}
          <div className="integration-group">
            <div className="integration-group-header">
              <h3 className="integration-group-title">Supabase (Database)</h3>
              <span className={`status-badge ${supabaseUrl && supabaseKey ? 'green' : 'yellow'}`}>
                {supabaseUrl && supabaseKey ? 'Connected' : 'Using Local SQLite'}
              </span>
            </div>

            <div className="settings-row">
              <div className="settings-field">
                <label className="settings-label">Project URL</label>
                <input
                  className="settings-input"
                  type="text"
                  placeholder="https://xxxx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">Anon Key</label>
                <div className="settings-input-wrap">
                  <input
                    className="settings-input has-toggle"
                    type={showSupabaseKey ? 'text' : 'password'}
                    placeholder="eyJhbGciOi..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                  />
                  <button
                    type="button"
                    className="settings-eye-btn"
                    onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                    aria-label="Toggle visibility"
                  >
                    {showSupabaseKey ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="settings-btn ghost sm">Connect to Supabase</button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            2. Business Profile
           ══════════════════════════════════════════ */}
        <section className="settings-card">
          <h2 className="settings-card-title">🏢 Business Information</h2>
          <p className="settings-card-subtitle">
            Your company details used across communications and branding
          </p>

          <div className="settings-row">
            <div className="settings-field">
              <label className="settings-label">Company Name</label>
              <input
                className="settings-input"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label className="settings-label">Phone Number</label>
              <input
                className="settings-input"
                type="text"
                placeholder="+1 (555) 000-0000"
                value={bizPhone}
                onChange={(e) => setBizPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-label">Email</label>
            <input
              className="settings-input"
              type="email"
              placeholder="contact@yourhvac.com"
              value={bizEmail}
              onChange={(e) => setBizEmail(e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label className="settings-label">Address</label>
            <textarea
              className="settings-textarea"
              placeholder="123 Main St, Suite 100&#10;Dallas, TX 75001"
              value={bizAddress}
              onChange={(e) => setBizAddress(e.target.value)}
            />
          </div>

          <div className="settings-row">
            <div className="settings-field">
              <label className="settings-label">Logo</label>
              <div className="logo-upload">
                <div className="logo-upload-icon">📤</div>
                <div className="logo-upload-text">
                  Drag &amp; drop your logo here, or click to browse
                </div>
                <div className="logo-upload-hint">PNG, JPG or SVG — max 2 MB</div>
              </div>
            </div>

            <div className="settings-field">
              <label className="settings-label">Brand Color</label>
              <div className="color-picker-wrap">
                <div
                  className="color-swatch-btn"
                  style={{ background: brandColor }}
                >
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                  />
                </div>
                <span className="color-hex-display">{brandColor.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            3. Automation Preferences
           ══════════════════════════════════════════ */}
        <section className="settings-card">
          <h2 className="settings-card-title">⚡ Automation Rules</h2>
          <p className="settings-card-subtitle">
            Fine-tune how the system automatically handles communications
          </p>

          <div className="automation-row">
            <div className="automation-row-info">
              <p className="automation-row-label">Auto text-back on missed calls</p>
              <p className="automation-row-note">
                Automatically send a text when a call is missed
              </p>
            </div>
            <Toggle checked={autoTextBack} onChange={setAutoTextBack} />
          </div>

          <div className="automation-row">
            <div className="automation-row-info">
              <p className="automation-row-label">AI-powered responses</p>
              <p className="automation-row-note">Requires AI API key</p>
            </div>
            <Toggle
              checked={aiResponses}
              onChange={setAiResponses}
              disabled={!aiApiKey}
            />
          </div>

          <div className="automation-row">
            <div className="automation-row-info">
              <p className="automation-row-label">
                Automatic review requests after service
              </p>
              <p className="automation-row-note">
                Send a review link after a job is marked complete
              </p>
            </div>
            <Toggle checked={autoReview} onChange={setAutoReview} />
          </div>

          <div className="automation-row">
            <div className="automation-row-info">
              <p className="automation-row-label">Estimate follow-up reminders</p>
              <p className="automation-row-note">
                Remind customers who haven&apos;t responded to estimates
              </p>
            </div>
            <Toggle checked={followUpReminders} onChange={setFollowUpReminders} />
          </div>

          <div className="inline-number-field">
            <div className="automation-row-info">
              <p className="automation-row-label">Follow-up delay (hours)</p>
              <p className="automation-row-note">
                Hours to wait before sending a follow-up
              </p>
            </div>
            <input
              type="number"
              className="inline-number-input"
              min={1}
              max={720}
              value={followUpDelay}
              onChange={(e) => setFollowUpDelay(Number(e.target.value))}
            />
          </div>

          <div className="inline-number-field">
            <div className="automation-row-info">
              <p className="automation-row-label">Max messages per day per customer</p>
              <p className="automation-row-note">
                Prevents spamming — caps daily outbound per contact
              </p>
            </div>
            <input
              type="number"
              className="inline-number-input"
              min={1}
              max={20}
              value={maxMessages}
              onChange={(e) => setMaxMessages(Number(e.target.value))}
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            4. Danger Zone
           ══════════════════════════════════════════ */}
        <section className="settings-card danger">
          <h2 className="settings-card-title">⚠️ Danger Zone</h2>
          <p className="settings-card-subtitle">
            Irreversible actions — proceed with caution
          </p>

          <div className="danger-action">
            <div className="danger-action-info">
              <h4>Reset All Data</h4>
              <p>
                Permanently erase every contact, message, campaign, and setting.
                This cannot be undone.
              </p>
            </div>

            {!confirmReset ? (
              <button
                className="settings-btn danger sm"
                onClick={() => setConfirmReset(true)}
              >
                Reset All Data
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="danger-confirm-text">Are you sure?</span>
                <button
                  className="settings-btn danger sm"
                  onClick={() => setConfirmReset(false)}
                >
                  Yes, Reset Everything
                </button>
                <button
                  className="settings-btn ghost sm"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="danger-action">
            <div className="danger-action-info">
              <h4>Clear Message History</h4>
              <p>
                Delete all sent and received messages. Contacts and campaigns
                will remain.
              </p>
            </div>

            {!confirmClear ? (
              <button
                className="settings-btn danger sm"
                onClick={() => setConfirmClear(true)}
              >
                Clear Message History
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="danger-confirm-text">Are you sure?</span>
                <button
                  className="settings-btn danger sm"
                  onClick={() => setConfirmClear(false)}
                >
                  Yes, Clear History
                </button>
                <button
                  className="settings-btn ghost sm"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            5. Footer Actions
           ══════════════════════════════════════════ */}
        <div className="settings-footer">
          <button className="settings-btn ghost">Discard Changes</button>
          <button className="settings-btn primary lg">Save All Settings</button>
        </div>
      </div>
    </>
  );
}
