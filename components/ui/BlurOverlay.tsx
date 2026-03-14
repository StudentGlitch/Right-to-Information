'use client';

import React from 'react';
import { THEME_COLORS } from '@/lib/constants';

interface BlurOverlayProps {
  children: React.ReactNode;
  isBlurred: boolean;
  message?: string;
}

export function BlurOverlay({
  children,
  isBlurred,
  message = 'Upgrade to Premium to unlock',
}: BlurOverlayProps): React.ReactElement {
  if (!isBlurred) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          filter: 'blur(4px)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.7,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(6, 13, 24, 0.6)',
          borderRadius: 10,
        }}
      >
        <div
          style={{
            background: THEME_COLORS.bgContent,
            border: `1px solid ${THEME_COLORS.border}`,
            borderRadius: 8,
            padding: '20px 28px',
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: THEME_COLORS.text, marginBottom: 8 }}>
            {message}
          </div>
          <div style={{ fontSize: 12, color: THEME_COLORS.textSecondary }}>
            Sign in and upgrade to access all features
          </div>
        </div>
      </div>
    </div>
  );
}
