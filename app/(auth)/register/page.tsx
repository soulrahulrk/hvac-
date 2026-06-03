'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create user and organization via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, orgName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError('Login failed after registration. Please log in manually.');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 480px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .auth-header h1 {
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 0%, #00d4ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 10px;
        }
        .auth-header p {
          color: rgba(255,255,255,0.5);
          font-size: 0.95rem;
          margin: 0;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .auth-label {
          font-size: 0.88rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
        }
        .auth-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s ease;
        }
        .auth-input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.15);
        }
        .auth-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #00d4ff, #3b82f6);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 14px;
          box-shadow: 0 4px 20px rgba(0,212,255,0.25);
        }
        .auth-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(0,212,255,0.4);
        }
        .auth-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .auth-error {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.88rem;
          text-align: center;
        }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.5);
        }
        .auth-link {
          color: #00d4ff;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .auth-link:hover {
          color: #3b82f6;
        }
      `}</style>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Start recovering revenue today</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            
            <div className="auth-field">
              <label className="auth-label">Your Name</label>
              <input 
                type="text" 
                className="auth-input" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Company Name</label>
              <input 
                type="text" 
                className="auth-input" 
                placeholder="Cool Air HVAC" 
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>
            
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input 
                type="email" 
                className="auth-input" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input 
                type="password" 
                className="auth-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-footer">
            Already have an account? <Link href="/login" className="auth-link">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}
