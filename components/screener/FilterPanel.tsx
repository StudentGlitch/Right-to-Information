'use client';

interface FilterPanelProps {
  sectors: string[];
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  selectedTier: string;
  onTierChange: (tier: string) => void;
  minScore: string;
  onMinScoreChange: (score: string) => void;
  maxScore: string;
  onMaxScoreChange: (score: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterPanel({
  sectors,
  selectedSector,
  onSectorChange,
  selectedTier,
  onTierChange,
  minScore,
  onMinScoreChange,
  maxScore,
  onMaxScoreChange,
  searchQuery,
  onSearchChange
}: FilterPanelProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Stock
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ticker or name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sector Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sector
          </label>
          <select
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        {/* Tier Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating Tier
          </label>
          <select
            value={selectedTier}
            onChange={(e) => onTierChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tiers</option>
            <option value="1">Tier 1: STRONG BUY (80-100)</option>
            <option value="2">Tier 2: BUY (65-79)</option>
            <option value="3">Tier 3: WATCH (50-64)</option>
            <option value="4">Tier 4: NEUTRAL (35-49)</option>
            <option value="5">Tier 5: AVOID (0-34)</option>
          </select>
        </div>

        {/* Score Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Score Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={minScore}
              onChange={(e) => onMinScoreChange(e.target.value)}
              placeholder="Min"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="flex items-center text-gray-500">-</span>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => onMaxScoreChange(e.target.value)}
              placeholder="Max"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Score Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Score Legend:</p>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded" 
                style={{ backgroundColor: 'rgba(0,200,81,0.12)', color: '#00C851' }}>
            80-100: STRONG BUY
          </span>
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded"
                style={{ backgroundColor: 'rgba(0,170,255,0.12)', color: '#00AAFF' }}>
            65-79: BUY
          </span>
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded"
                style={{ backgroundColor: 'rgba(255,170,0,0.12)', color: '#FFAA00' }}>
            50-64: WATCH
          </span>
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded"
                style={{ backgroundColor: 'rgba(136,136,136,0.12)', color: '#888888' }}>
            35-49: NEUTRAL
          </span>
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded"
                style={{ backgroundColor: 'rgba(255,68,68,0.12)', color: '#FF4444' }}>
            0-34: AVOID
          </span>
        </div>
      </div>
    </div>
  );
}
