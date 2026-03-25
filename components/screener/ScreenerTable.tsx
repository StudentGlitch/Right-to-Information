'use client';

import { useState } from 'react';

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

interface ScreenerTableProps {
  stocks: Stock[];
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function ScreenerTable({ stocks, onSort, sortBy, sortOrder }: ScreenerTableProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'T';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'B';
    return num.toFixed(0);
  };

  const formatPrice = (price: number) => price.toLocaleString('id-ID');

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="text-gray-400 ml-1">⇅</span>;
    return sortOrder === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('ticker')}>
              Ticker <SortIcon field="ticker" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sector
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('price')}>
              Price <SortIcon field="price" />
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('change')}>
              Change % <SortIcon field="change" />
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('composite')}>
              Score <SortIcon field="composite" />
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('pe')}>
              P/E <SortIcon field="pe" />
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('roe')}>
              ROE % <SortIcon field="roe" />
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('dividendYield')}>
              Div Yield % <SortIcon field="dividendYield" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stocks.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                No stocks found matching your criteria
              </td>
            </tr>
          ) : (
            stocks.map((stock) => (
              <tr key={stock.ticker} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-blue-600">
                  {stock.ticker}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {stock.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {stock.sector}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">
                  {formatPrice(stock.price)}
                </td>
                <td className={`px-4 py-3 text-right text-sm font-medium ${
                  stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold">
                  {stock.scores.composite}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="px-2 py-1 text-xs font-semibold rounded"
                    style={{
                      backgroundColor: stock.tier.bg,
                      color: stock.tier.color
                    }}
                  >
                    {stock.tier.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {stock.pe?.toFixed(1) || '-'}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {stock.roe?.toFixed(1) || '-'}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {stock.dividendYield?.toFixed(2) || '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
