'use client';

import React, { useCallback } from 'react';
import { TIER_COLORS } from '@/lib/constants';
import { AuthButton } from './AuthButton';
import type { Stock } from '@/lib/types';

interface AppHeaderProps {
  dynamicTitle: string;
  search: string;
  setSearch: (query: string) => void;
  hasFilter: boolean;
  clearFilters: () => void;
  setDrawerOpen: (open: boolean) => void;
  drawerOpen: boolean;
  tierFilter: Stock['tier'] | null;
  setTierFilter: (tier: Stock['tier'] | null) => void;
  hhiFilter?: string | null;
  setHhiFilter?: (hl: string | null) => void;
  flagFilter?: string | null;
  setFlagFilter?: (flag: string | null) => void;
}

export function AppHeader({
  dynamicTitle,
  search,
  setSearch,
  hasFilter,
  clearFilters,
  setDrawerOpen,
  drawerOpen,
  tierFilter,
  setTierFilter,
  hhiFilter = null,
  setHhiFilter,
  flagFilter = null,
  setFlagFilter,
}: AppHeaderProps): React.ReactElement {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setSearch(e.target.value);
    },
    [setSearch]
  );

  return (
    <div className="app-header">
      <div className="header-row">
        <div>
          <div className="header-eyebrow">IDX · BURSA EFEK INDONESIA</div>
          <h1 className="header-title">{dynamicTitle}</h1>
        </div>
        <div className="header-right">
          <div className="search-wrap">
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 10,
                color: '#457B9D',
                fontSize: 13,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search stock, issuer, or owner…"
              aria-label="Search stocks by code, issuer name, or top owner"
              className="search-input"
              style={{
                border: `1px solid ${search ? '#457B9D' : '#1e3a52'}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#457B9D';
                e.currentTarget.style.boxShadow = '0 0 0 2px #457B9D33';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = search ? '#457B9D' : '#1e3a52';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: 10,
                  background: 'none',
                  border: 'none',
                  color: '#6b8aad',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
          <AuthButton />
          {hasFilter && (
            <button
              onClick={clearFilters}
              style={{
                background: '#132030',
                border: '1px solid #e76f5155',
                color: '#e76f51',
                borderRadius: 6,
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              ✕ Clear all filters
            </button>
          )}
          <button
            className="hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
          >
            ☰
          </button>
        </div>
      </div>

      {hasFilter && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {tierFilter && (
            <span
              style={{
                background: TIER_COLORS[tierFilter] + '33',
                border: `1px solid ${TIER_COLORS[tierFilter]}`,
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 11,
                color: TIER_COLORS[tierFilter],
                cursor: 'pointer',
              }}
              onClick={() => setTierFilter(null)}
            >
              Tier: {tierFilter} ×
            </span>
          )}
          {hhiFilter && setHhiFilter && (
            <span
              style={{
                background: '#2A9D8F33',
                border: '1px solid #2A9D8F',
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 11,
                color: '#2A9D8F',
                cursor: 'pointer',
              }}
              onClick={() => setHhiFilter(null)}
            >
              HHI: {hhiFilter} ×
            </span>
          )}
          {flagFilter && setFlagFilter && (
            <span
              style={{
                background: '#e9c46a33',
                border: '1px solid #e9c46a',
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 11,
                color: '#e9c46a',
                cursor: 'pointer',
              }}
              onClick={() => setFlagFilter(null)}
            >
              Flag: {flagFilter} ×
            </span>
          )}
        </div>
      )}
    </div>
  );
}
