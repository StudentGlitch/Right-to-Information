'use client';

import React from 'react';

interface TabBarProps {
  NAV_TABS: [string, string][];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export function TabBar({ NAV_TABS, activeTab, setActiveTab }: TabBarProps): React.ReactElement {
  return (
    <div className="tab-nav-desktop">
      {NAV_TABS.map(([id, label]) => (
        <button
          key={id}
          data-tour={id === 'overview' ? 'tab-overview' : id === 'table' ? 'tab-screener' : undefined}
          onClick={() => setActiveTab(id)}
          className={`tab-btn${activeTab === id ? ' active' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
