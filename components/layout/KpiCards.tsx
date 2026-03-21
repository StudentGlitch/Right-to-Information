'use client';

import React from 'react';
import type { AnalyticsStats, Stock } from '@/lib/types';

interface KpiCardsProps {
  stats: AnalyticsStats | null;
  loading?: boolean;
  tierFilter: Stock['tier'] | null;
  setTierFilter: (tier: Stock['tier'] | null) => void;
}

export function KpiCards({ stats, loading = false, tierFilter, setTierFilter }: KpiCardsProps): React.ReactElement | null {
  if (loading || !stats) {
    return (
      <div className="kpi-cards" data-tour="kpi-cards">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="kpi-card">
            <div className="skeleton" style={{ height: 10, width: '60%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 24, width: '40%' }} />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'TOTAL STOCKS', val: stats.totalStocks, color: '#a8c8e8' },
    {
      label: '🔴 RED RISK',
      val: stats.byTier.red,
      sub: `${stats.totalStocks ? Math.round((stats.byTier.red / stats.totalStocks) * 100) : 0}% of total`,
      color: '#E76F51',
      click: () => setTierFilter(tierFilter === 'Red' ? null : 'Red'),
    },
    {
      label: '🟡 AMBER RISK',
      val: stats.byTier.amber,
      color: '#E9C46A',
      click: () => setTierFilter(tierFilter === 'Amber' ? null : 'Amber'),
    },
    {
      label: '🟢 GREEN RISK',
      val: stats.byTier.green,
      color: '#2A9D8F',
      click: () => setTierFilter(tierFilter === 'Green' ? null : 'Green'),
    },
    {
      label: 'AVG HHI',
      val: stats.avgHHI?.toFixed(0),
      sub: 'High conc. >2,500',
      color: stats.avgHHI > 2500 ? '#E76F51' : '#E9C46A',
    },
    {
      label: 'AVG FREE FLOAT',
      val: stats.avgFloat?.toFixed(1) + '%',
      sub: 'IDX min: 15%',
      color: stats.avgFloat < 15 ? '#E76F51' : '#2A9D8F',
    },
  ];

  return (
    <div className="kpi-cards" data-tour="kpi-cards">
      {cards.map((k) => (
        <div
          key={k.label}
          className={`kpi-card${k.click ? ' clickable' : ''}`}
          onClick={k.click}
          title={k.click ? `Filter by ${k.label}` : undefined}
        >
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value" style={{ color: k.color }}>{k.val}</div>
          {k.sub && <div className="kpi-sub">{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}
