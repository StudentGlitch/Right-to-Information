'use client';

import { useState, useEffect } from 'react';
import { FilterPanel } from '@/components/screener/FilterPanel';
import { ScreenerTable } from '@/components/screener/ScreenerTable';

interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  pe: number;
  pb: number;
  roe: number;
  dividendYield: number;
  scores: {
    composite: number;
    fundamental: number;
    technical: number;
    sentiment: number;
    liquidity: number;
  };
  tier: {
    level: number;
    label: string;
    color: string;
    bg: string;
  };
}

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sectors, setSectors] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedTier, setSelectedTier] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [sortBy, setSortBy] = useState('composite');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch sectors on mount
  useEffect(() => {
    fetch('/api/screener/filters')
      .then(res => res.json())
      .then(data => setSectors(data.sectors))
      .catch(err => console.error('Failed to load sectors:', err));
  }, []);

  // Fetch stocks when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedSector !== 'All') params.append('sector', selectedSector);
    if (selectedTier) params.append('tier', selectedTier);
    if (minScore) params.append('minScore', minScore);
    if (maxScore) params.append('maxScore', maxScore);
    params.append('sortBy', sortBy);
    params.append('order', sortOrder);

    setLoading(true);
    fetch(`/api/screener?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStocks(data.data);
          setError(null);
        } else {
          setError(data.error || 'Failed to load stocks');
        }
      })
      .catch(err => {
        console.error('Error fetching stocks:', err);
        setError('Failed to load stocks');
      })
      .finally(() => setLoading(false));
  }, [searchQuery, selectedSector, selectedTier, minScore, maxScore, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                Right to Information
              </a>
              <div className="ml-8 flex space-x-4">
                <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/screener" className="text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
                  AI Stock Screener
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🇮🇩 JCI Stock Screener
          </h1>
          <p className="mt-2 text-gray-600">
            AI-powered institutional-grade analysis for Indonesian stocks
          </p>
        </div>

        {/* Filters */}
        <FilterPanel
          sectors={sectors}
          selectedSector={selectedSector}
          onSectorChange={setSelectedSector}
          selectedTier={selectedTier}
          onTierChange={setSelectedTier}
          minScore={minScore}
          onMinScoreChange={setMinScore}
          maxScore={maxScore}
          onMaxScoreChange={setMaxScore}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Results ({stocks.length} stocks)
              </h2>
              {loading && (
                <span className="text-sm text-gray-500">Loading...</span>
              )}
            </div>
          </div>

          {error ? (
            <div className="px-6 py-8 text-center text-red-600">
              {error}
            </div>
          ) : (
            <ScreenerTable
              stocks={stocks}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📊 How the Score Works
          </h3>
          <p className="text-sm text-blue-800">
            Each stock is scored 0-100 based on: <strong>Fundamental (35%)</strong> + <strong>Technical (30%)</strong> + <strong>Sentiment (20%)</strong> + <strong>Liquidity (15%)</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
