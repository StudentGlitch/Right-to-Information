'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (result: unknown) => void;
        onPending?: (result: unknown) => void;
        onError?: (result: unknown) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

const FEATURES = [
  'Risk Map — Interactive scatter plot of HHI vs Free Float for every stock',
  'HHI Distribution — Ownership concentration analysis across all tiers',
  'Governance Flags — Filter stocks by specific risk flags (LowFloat, Insider, etc.)',
  'Full Screener — Unlimited access to all stocks in the sortable table',
  'Owners Tab — See all institutional owners and their full portfolios',
  'Stats Tab — Advanced aggregated statistics and cross-stock analytics',
];

export default function UpgradePage(): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('status');
    if (s === 'success' || s === 'pending' || s === 'error') {
      setStatus(s);
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute(
      'data-client-key',
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''
    );
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handlePayment = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to create payment');
        return;
      }

      const { token } = await res.json();

      if (typeof window.snap?.pay !== 'function') {
        setError('Payment script not loaded. Please refresh and try again.');
        return;
      }

      window.snap.pay(token, {
        onSuccess: () => {
          setStatus('success');
          router.refresh();
        },
        onPending: () => {
          setStatus('pending');
        },
        onError: () => {
          setError('Payment failed. Please try again.');
        },
        onClose: () => {
          setIsLoading(false);
        },
      });
    } catch {
      setError('Failed to create payment');
    } finally {
      setIsLoading(false);
    }
  };

  const isSuccess = status === 'success';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060d18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 5vw, 40px)',
        fontFamily: 'DM Sans, sans-serif',
        color: '#e8f4f8',
      }}
    >
      <div className="upgrade-card">
        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            color: '#457b9d',
            fontFamily: 'DM Mono, monospace',
            marginBottom: 16,
          }}
        >
          IDX · GOVERNANCE DASHBOARD
        </div>

        {status === 'success' && (
          <div
            style={{
              background: '#2a9d8f18',
              border: '1px solid #2a9d8f55',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 20,
              color: '#2a9d8f',
              fontSize: 14,
            }}
          >
            ✅ Payment successful! Your account has been upgraded to Premium.
            <button
              type="button"
              onClick={() => (window.location.href = '/')}
              style={{
                display: 'block',
                margin: '10px auto 0',
                padding: '8px 20px',
                fontSize: 12,
                background: '#2a9d8f',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Go to Dashboard →
            </button>
          </div>
        )}

        {status === 'pending' && (
          <div
            style={{
              background: '#e9c46a18',
              border: '1px solid #e9c46a55',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 20,
              color: '#e9c46a',
              fontSize: 14,
            }}
          >
            ⏳ Payment pending — we&apos;ll activate your account once confirmed.
          </div>
        )}

        {status === 'error' && (
          <div
            style={{
              background: '#e76f5118',
              border: '1px solid #e76f5155',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 20,
              color: '#e76f51',
              fontSize: 14,
            }}
          >
            ❌ Payment failed or was cancelled. Please try again.
          </div>
        )}

        {/* Lock icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#2a9d8f18',
            border: '1px solid #2a9d8f44',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 20px',
          }}
        >
          🔒
        </div>

        <h1
          style={{
            fontSize: 'clamp(20px, 5vw, 26px)',
            fontWeight: 700,
            color: '#e8f4f8',
            marginBottom: 8,
            letterSpacing: '-0.01em',
          }}
        >
          Unlock Premium Access
        </h1>

        <p
          style={{
            fontSize: 14,
            color: '#a8c8e8',
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Full governance analytics for every IDX-listed security.
        </p>

        <ul className="feature-list" style={{ marginBottom: 24 }}>
          {FEATURES.map((text, i) => (
            <li key={i} className="feature-item">
              <span className="feature-check">✓</span>
              <span style={{ color: '#a8c8e8', fontSize: 13, lineHeight: 1.5 }}>{text}</span>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div style={{ height: 1, background: '#132030', margin: '0 0 20px' }} />

        {/* Price */}
        <div style={{ marginBottom: 20 }}>
          <div className="price-display">Rp 99.000</div>
          <div style={{ fontSize: 12, color: '#6b8aad', marginTop: 4 }}>
            per month · cancel anytime
          </div>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          disabled={isLoading || isSuccess}
          className={`pay-btn${isLoading ? ' loading' : ''}`}
          style={{ marginBottom: 12 }}
        >
          {isSuccess
            ? '✅ Upgrade Complete'
            : isLoading
              ? 'Creating transaction…'
              : 'Pay with GoPay / Midtrans →'}
        </button>

        <div
          style={{
            marginTop: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 10, color: '#6b8aad' }}>Accepts:</span>
          {['GoPay', 'QRIS', 'Bank Transfer', 'Credit Card'].map((label) => (
            <span
              key={label}
              style={{
                background: '#132030',
                border: '1px solid #1e3a52',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10,
                color: '#a8c8e8',
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {error && (
          <div style={{ color: '#e76f51', fontSize: 12, marginTop: 8 }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            marginTop: 16,
            fontSize: 12,
            color: '#6b8aad',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'color 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#a8c8e8')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#6b8aad')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
