'use client';

import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const campaignTabs = [
  'All',
  'REACTIVATION',
  'ESTIMATE_FOLLOWUP',
  'REVIEW_REQUEST',
  'MAINTENANCE',
  'REFERRAL',
  'MEMBERSHIP',
] as const;

type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'COMPLETED' | 'ARCHIVED';

interface Campaign {
  id: string;
  icon: string;
  name: string;
  type: string;
  status: CampaignStatus;
  description: string;
  sent: number;
  responded: number;
  converted: number;
  convertedLabel?: string;
  revenue: string | null;
}

function statusClass(status: string) {
  switch (status) {
    case 'ACTIVE': return 'campaign-badge--active';
    case 'PAUSED': return 'campaign-badge--paused';
    case 'DRAFT': return 'campaign-badge--draft';
    case 'COMPLETED': return 'campaign-badge--completed';
    default: return 'campaign-badge--draft';
  }
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'REACTIVATION',
    segmentId: '',
    templateContent: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [campRes, segRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/segments')
      ]);
      const [campData, segData] = await Promise.all([campRes.json(), segRes.json()]);

      if (Array.isArray(segData)) setSegments(segData);
      
      if (Array.isArray(campData)) {
        const mapped = campData.map((c: any) => ({
          id: c.id,
          icon: c.type === 'REACTIVATION' ? '🔄' : c.type === 'REVIEW_REQUEST' ? '⭐' : '🚀',
          name: c.name,
          type: c.type,
          status: c.status,
          description: c.segment?.name ? `Targeting: ${c.segment.name}` : 'No target segment',
          sent: c.totalSent || 0,
          responded: c.totalResponded || 0,
          converted: 0,
          revenue: null,
        }));
        setCampaigns(mapped);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.segmentId) return alert('Name and Segment required');

    try {
      // 1. Create Campaign
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          channel: 'SMS',
          scheduleType: 'IMMEDIATE',
          targetSegment: 'CUSTOM',
          segmentId: formData.segmentId,
          steps: [
            { templateContent: formData.templateContent, delayMinutes: 0 }
          ]
        })
      });

      const campaign = await res.json();
      
      // 2. Launch immediately
      if (campaign.id) {
        await fetch(`/api/campaigns/${campaign.id}/launch`, { method: 'POST' });
        alert('Campaign created and launched successfully!');
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('Error creating campaign');
    }
  };

  const filteredCampaigns = activeTab === 'All'
    ? campaigns
    : campaigns.filter((c) => c.type === activeTab);

  return (
    <div className="campaigns-page">
      <div className="campaigns-header">
        <div className="campaigns-header-text">
          <h1 className="campaigns-title">Campaign Manager</h1>
          <p className="campaigns-subtitle">Create and manage automated revenue recovery campaigns</p>
        </div>
        <button className="campaigns-new-btn" onClick={() => setShowModal(true)}>
          <span className="campaigns-new-btn-icon">+</span> New Campaign
        </button>
      </div>

      <div className="campaigns-tabs">
        {campaignTabs.map((tab) => (
          <button
            key={tab}
            className={`campaigns-tab ${activeTab === tab ? 'campaigns-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="campaigns-grid">
        {isLoading && <p>Loading campaigns...</p>}
        {!isLoading && filteredCampaigns.length === 0 && <p>No campaigns found.</p>}
        {!isLoading && filteredCampaigns.map((campaign) => {
          const conversionRate = campaign.sent > 0 ? Math.round((campaign.converted / campaign.sent) * 100) : 0;
          return (
            <div key={campaign.id} className="campaign-card glass-card">
              <div className="campaign-card-header">
                <div className="campaign-card-title-row">
                  <span className="campaign-card-icon">{campaign.icon}</span>
                  <h3 className="campaign-card-name">{campaign.name}</h3>
                </div>
                <span className={`campaign-badge ${statusClass(campaign.status)}`}>{campaign.status}</span>
              </div>
              <p className="campaign-card-desc">{campaign.description}</p>
              
              <div className="campaign-card-stats">
                <div className="campaign-card-stat">
                  <span className="campaign-card-stat-val">{campaign.sent}</span>
                  <span className="campaign-card-stat-lbl">Sent</span>
                </div>
                <div className="campaign-card-stat">
                  <span className="campaign-card-stat-val">{campaign.responded}</span>
                  <span className="campaign-card-stat-lbl">Responded</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="campaign-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="campaign-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="campaign-modal-header">
              <h2 className="campaign-modal-title">Create New Campaign</h2>
              <button className="campaign-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="campaign-modal-form" onSubmit={handleSubmit}>
              <div className="campaign-form-group">
                <label className="campaign-form-label">Campaign Name</label>
                <input required className="campaign-form-input" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="campaign-form-group">
                <label className="campaign-form-label">Type</label>
                <select className="campaign-form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="REACTIVATION">Reactivation</option>
                  <option value="ESTIMATE_FOLLOWUP">Estimate Follow-Up</option>
                  <option value="REVIEW_REQUEST">Review Request</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div className="campaign-form-group">
                <label className="campaign-form-label">Target Segment</label>
                <select required className="campaign-form-select" value={formData.segmentId} onChange={e => setFormData({...formData, segmentId: e.target.value})}>
                  <option value="">Select segment</option>
                  {segments.map((seg) => (
                    <option key={seg.id} value={seg.id}>{seg.name} ({seg.customerCount} contacts)</option>
                  ))}
                </select>
              </div>

              <div className="campaign-form-group">
                <label className="campaign-form-label">SMS Template Content (AI personalized)</label>
                <textarea required className="campaign-form-textarea" rows={4} value={formData.templateContent} onChange={e => setFormData({...formData, templateContent: e.target.value})} placeholder="Hi {firstName}, we noticed..." />
              </div>

              <div className="campaign-modal-actions">
                <button type="button" className="campaign-modal-btn campaign-modal-btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="campaign-modal-btn campaign-modal-btn--primary">🚀 Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
