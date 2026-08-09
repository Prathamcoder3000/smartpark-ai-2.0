'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`relative flex border-b border-smartBorder ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative py-2.5 px-4 text-sm font-sans font-medium transition-colors select-none focus:outline-none focus-visible:text-smartTextPrimary ${
              isActive ? 'text-smartTextPrimary' : 'text-smartTextSecondary hover:text-smartTextPrimary/80'
            }`}
          >
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-signature"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

Tabs.displayName = 'Tabs';
