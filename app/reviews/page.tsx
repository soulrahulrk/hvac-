'use client';

import { useEffect, useState } from 'react';

const stats = [
  { label: 'Average Rating', value: '4.8⭐', color: '#f59e0b', icon: '⭐' },
  { label: 'Total Reviews', value: '142', color: '#3b82f6', icon: '📊' },
  { label: 'Unanswered', value: '5', color: '#ef4444', icon: '⚠️' }
];

const mockReviews = [
  { id: 1, name: 'Michael T.', rating: 5, date: '2 days ago', text: 'Fantastic service. The tech was on time and fixed our AC in under an hour.', answered: true },
  { id: 2, name: 'Sarah L.', rating: 5, date: '4 days ago', text: 'Very professional. Walked me through everything they were doing.', answered: false },
  { id: 3, name: 'David W.', rating: 4, date: '1 week ago', text: 'Good work but arrived a little later than the scheduled window.', answered: false },
  { id: 4, name: 'Jessica M.', rating: 5, date: '2 weeks ago', text: 'Always rely on these guys for our bi-annual maintenance. Great team!', answered: true },
  { id: 5, name: 'Brian C.', rating: 5, date: '2 weeks ago', text: 'Life savers! AC broke down on the hottest day of the year.', answered: false },
];

export default function ReviewsPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .reviews-page {
          opacity: 0;
          transition: opacity 0.6s ease;
          padding: 0 0 2rem;
        }
        .reviews-page--visible { opacity: 1; }

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

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease both;
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
          color: #fff;
          margin: 0.5rem 0 0.2rem;
          line-height: 1.1;
        }
        .stat-label {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          animation: fadeInUp 0.7s ease both;
          animation-delay: 0.2s;
        }

        .review-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .reviewer-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-weight: 600;
          color: #fff;
        }

        .reviewer-details {
          display: flex;
          flex-direction: column;
        }
        
        .reviewer-name {
          font-weight: 600;
          color: #fff;
          font-size: 0.95rem;
        }

        .review-date {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
        }

        .review-rating {
          display: flex;
          gap: 2px;
          color: #f59e0b;
          font-size: 0.9rem;
        }

        .review-text {
          color: rgba(255,255,255,0.8);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .review-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .stats-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className={`reviews-page ${visible ? 'reviews-page--visible' : ''}`}>
        <header className="dash-header">
          <h1>Reputation Management</h1>
          <p>Monitor and reply to Google Business Profile reviews</p>
        </header>

        <div className="stats-row">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="glass-card stat-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
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
                </div>
                <div className="stat-icon" style={{ background: `${s.color}18` }}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="reviews-list">
          {mockReviews.map((review) => (
            <div key={review.id} className="glass-card review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.name.charAt(0)}
                  </div>
                  <div className="reviewer-details">
                    <span className="reviewer-name">{review.name}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                </div>
                <div className="review-rating">
                  {'⭐'.repeat(review.rating)}
                </div>
              </div>
              <div className="review-text">
                {review.text}
              </div>
              {!review.answered && (
                <div className="review-actions">
                  <button className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Generate AI Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
