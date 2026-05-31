'use client';

import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const campaignTabs = [
  'All',
  'Reactivation',
  'Estimate Follow-Up',
  'Review Request',
  'Maintenance',
  'Referral',
  'Membership',
] as const;

type CampaignStatus = 'Active' | 'Paused' | 'Draft' | 'Completed';

interface Campaign {
  id: number;
  icon: string;
  name: string;
  type: (typeof campaignTabs)[number];
  status: CampaignStatus;
  description: string;
  sent: number;
  responded: number;
  converted: number;
  convertedLabel?: string;
  revenue: string | null;
}

const campaigns: Campaign[] = [
  {
    id: 1,
    icon: '🔄',
    name: 'Dormant Lead Reactivation',
    type: 'Reactivation',
    status: 'Active',
    description:
      'Reaching out to 200 dormant leads with personalized reactivation messages',
    sent: 145,
    responded: 42,
    converted: 18,
    revenue: '$8,100',
  },
  {
    id: 2,
    icon: '📋',
    name: 'Open Estimate Follow-Up',
    type: 'Estimate Follow-Up',
    status: 'Active',
    description:
      'Following up on 50 unsent estimates with urgency messaging',
    sent: 50,
    responded: 18,
    converted: 8,
    revenue: '$9,600',
  },
  {
    id: 3,
    icon: '🌸',
    name: 'Spring AC Tune-Up',
    type: 'Maintenance',
    status: 'Active',
    description:
      "Seasonal campaign targeting customers who haven't scheduled spring maintenance",
    sent: 320,
    responded: 89,
    converted: 45,
    revenue: '$5,400',
  },
  {
    id: 4,
    icon: '⭐',
    name: 'Google Review Collection',
    type: 'Review Request',
    status: 'Active',
    description: 'Requesting reviews from recent satisfied customers',
    sent: 85,
    responded: 38,
    converted: 28,
    convertedLabel: 'reviews collected',
    revenue: null,
  },
  {
    id: 5,
    icon: '🏷️',
    name: 'Membership Renewal',
    type: 'Membership',
    status: 'Paused',
    description: 'Reminding lapsed members about renewal benefits',
    sent: 67,
    responded: 22,
    converted: 13,
    convertedLabel: 'renewed',
    revenue: '$2,340',
  },
  {
    id: 6,
    icon: '🎁',
    name: 'Referral Rewards',
    type: 'Referral',
    status: 'Draft',
    description:
      'Incentivizing existing customers to refer friends and family',
    sent: 0,
    responded: 0,
    converted: 0,
    revenue: null,
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: status → CSS modifier                                      */
/* ------------------------------------------------------------------ */

function statusClass(status: CampaignStatus) {
  switch (status) {
    case 'Active':
      return 'campaign-badge--active';
    case 'Paused':
      return 'campaign-badge--paused';
    case 'Draft':
      return 'campaign-badge--draft';
    case 'Completed':
      return 'campaign-badge--completed';
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);

  /* Filter campaigns by tab */
  const filteredCampaigns =
    activeTab === 'All'
      ? campaigns
      : campaigns.filter((c) => c.type === activeTab);

  return (
    <div className="campaigns-page">
      {/* ---- Page Header ---- */}
      <div className="campaigns-header">
        <div className="campaigns-header-text">
          <h1 className="campaigns-title">Campaign Manager</h1>
          <p className="campaigns-subtitle">
            Create and manage automated revenue recovery campaigns
          </p>
        </div>
        <button
          className="campaigns-new-btn"
          onClick={() => setShowModal(true)}
        >
          <span className="campaigns-new-btn-icon">+</span> New Campaign
        </button>
      </div>

      {/* ---- Stats Row ---- */}
      <div className="campaigns-stats">
        <div className="campaigns-stat-card">
          <span className="campaigns-stat-icon">🚀</span>
          <div className="campaigns-stat-info">
            <span className="campaigns-stat-value">6</span>
            <span className="campaigns-stat-label">Active Campaigns</span>
          </div>
        </div>

        <div className="campaigns-stat-card">
          <span className="campaigns-stat-icon">📤</span>
          <div className="campaigns-stat-info">
            <span className="campaigns-stat-value">847</span>
            <span className="campaigns-stat-label">Total Sent</span>
          </div>
        </div>

        <div className="campaigns-stat-card">
          <span className="campaigns-stat-icon">💬</span>
          <div className="campaigns-stat-info">
            <span className="campaigns-stat-value">34.2%</span>
            <span className="campaigns-stat-label">Response Rate</span>
          </div>
        </div>

        <div className="campaigns-stat-card">
          <span className="campaigns-stat-icon">💰</span>
          <div className="campaigns-stat-info">
            <span className="campaigns-stat-value campaigns-stat-value--green">
              $26,310
            </span>
            <span className="campaigns-stat-label">Revenue Recovered</span>
          </div>
        </div>
      </div>

      {/* ---- Campaign Type Tabs ---- */}
      <div className="campaigns-tabs">
        {campaignTabs.map((tab) => (
          <button
            key={tab}
            className={`campaigns-tab ${activeTab === tab ? 'campaigns-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ---- Campaign Cards Grid ---- */}
      <div className="campaigns-grid">
        {filteredCampaigns.map((campaign) => {
          const conversionRate =
            campaign.sent > 0
              ? Math.round((campaign.converted / campaign.sent) * 100)
              : 0;

          return (
            <div key={campaign.id} className="campaign-card glass-card">
              {/* Card Header */}
              <div className="campaign-card-header">
                <div className="campaign-card-title-row">
                  <span className="campaign-card-icon">{campaign.icon}</span>
                  <h3 className="campaign-card-name">{campaign.name}</h3>
                </div>
                <span
                  className={`campaign-badge ${statusClass(campaign.status)}`}
                >
                  {campaign.status}
                </span>
              </div>

              {/* Description */}
              <p className="campaign-card-desc">{campaign.description}</p>

              {/* Stats Row */}
              {campaign.status !== 'Draft' ? (
                <>
                  <div className="campaign-card-stats">
                    <div className="campaign-card-stat">
                      <span className="campaign-card-stat-val">
                        {campaign.sent}
                      </span>
                      <span className="campaign-card-stat-lbl">Sent</span>
                    </div>
                    <div className="campaign-card-stat">
                      <span className="campaign-card-stat-val">
                        {campaign.responded}
                      </span>
                      <span className="campaign-card-stat-lbl">Responded</span>
                    </div>
                    <div className="campaign-card-stat">
                      <span className="campaign-card-stat-val">
                        {campaign.converted}
                      </span>
                      <span className="campaign-card-stat-lbl">
                        {campaign.convertedLabel ?? 'Converted'}
                      </span>
                    </div>
                    <div className="campaign-card-stat">
                      <span className="campaign-card-stat-val campaign-card-stat-val--green">
                        {campaign.revenue ?? 'N/A'}
                      </span>
                      <span className="campaign-card-stat-lbl">Revenue</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="campaign-progress">
                    <div className="campaign-progress-header">
                      <span className="campaign-progress-label">
                        Conversion Rate
                      </span>
                      <span className="campaign-progress-value">
                        {conversionRate}%
                      </span>
                    </div>
                    <div className="campaign-progress-track">
                      <div
                        className="campaign-progress-fill"
                        style={{ width: `${conversionRate}%` }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="campaign-card-draft-msg">
                  <span className="campaign-card-draft-icon">📝</span>
                  <span>Not yet launched</span>
                </div>
              )}

              {/* Actions */}
              <div className="campaign-card-actions">
                {campaign.status === 'Active' && (
                  <button className="campaign-action-btn campaign-action-btn--warn">
                    ⏸ Pause
                  </button>
                )}
                {campaign.status === 'Paused' && (
                  <button className="campaign-action-btn campaign-action-btn--success">
                    ▶ Resume
                  </button>
                )}
                {campaign.status === 'Draft' && (
                  <button className="campaign-action-btn campaign-action-btn--success">
                    ▶ Launch
                  </button>
                )}
                <button className="campaign-action-btn">✏️ Edit</button>
                <button className="campaign-action-btn campaign-action-btn--primary">
                  📊 View Report
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- New Campaign Modal ---- */}
      {showModal && (
        <div
          className="campaign-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="campaign-modal glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="campaign-modal-header">
              <h2 className="campaign-modal-title">Create New Campaign</h2>
              <button
                className="campaign-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form className="campaign-modal-form" onSubmit={(e) => e.preventDefault()}>
              {/* Campaign Name */}
              <div className="campaign-form-group">
                <label className="campaign-form-label" htmlFor="cmp-name">
                  Campaign Name
                </label>
                <input
                  id="cmp-name"
                  className="campaign-form-input"
                  type="text"
                  placeholder="e.g. Summer Tune-Up Blitz"
                />
              </div>

              {/* Type */}
              <div className="campaign-form-group">
                <label className="campaign-form-label" htmlFor="cmp-type">
                  Type
                </label>
                <select id="cmp-type" className="campaign-form-select">
                  <option value="">Select campaign type</option>
                  <option value="reactivation">Reactivation</option>
                  <option value="estimate">Estimate Follow-Up</option>
                  <option value="review">Review Request</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="referral">Referral</option>
                  <option value="membership">Membership</option>
                </select>
              </div>

              {/* Target Segment */}
              <div className="campaign-form-group">
                <label className="campaign-form-label" htmlFor="cmp-segment">
                  Target Segment
                </label>
                <select id="cmp-segment" className="campaign-form-select">
                  <option value="">Select target segment</option>
                  <option value="dormant-90">Dormant 90+ days</option>
                  <option value="dormant-180">Dormant 180+ days</option>
                  <option value="open-estimates">Open Estimates</option>
                  <option value="recent-customers">Recent Customers</option>
                  <option value="lapsed-members">Lapsed Members</option>
                  <option value="all-customers">All Customers</option>
                </select>
              </div>

              {/* Message Template */}
              <div className="campaign-form-group">
                <label className="campaign-form-label" htmlFor="cmp-message">
                  Message Template
                </label>
                <textarea
                  id="cmp-message"
                  className="campaign-form-textarea"
                  rows={4}
                  placeholder="Hi {first_name}, we noticed it's been a while since your last HVAC service..."
                />
              </div>

              {/* Schedule */}
              <div className="campaign-form-group">
                <label className="campaign-form-label" htmlFor="cmp-schedule">
                  Schedule
                </label>
                <select id="cmp-schedule" className="campaign-form-select">
                  <option value="immediate">Immediate</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {/* Actions */}
              <div className="campaign-modal-actions">
                <button
                  type="button"
                  className="campaign-modal-btn campaign-modal-btn--ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="campaign-modal-btn campaign-modal-btn--secondary"
                >
                  👁 Preview
                </button>
                <button
                  type="submit"
                  className="campaign-modal-btn campaign-modal-btn--primary"
                >
                  🚀 Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
