import React, { useState } from 'react';
import clsx from 'clsx';

export const Tabs = ({ children, className, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = React.Children.toArray(children).filter(child => child.type === Tab);
  const panels = React.Children.toArray(children).filter(child => child.type === TabPanel);

  return (
    <div className={clsx('w-full font-inter', className)}>
      <div className="flex border-b border-raahx-border overflow-x-auto hide-scrollbar">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={clsx(
              'px-5 py-4 text-sm font-semibold transition-colors whitespace-nowrap outline-none relative',
              activeTab === index 
                ? 'text-raahx-orange' 
                : 'text-raahx-slate hover:text-raahx-navy hover:bg-gray-50'
            )}
            onClick={() => setActiveTab(index)}
          >
            {tab.props.label}
            {activeTab === index && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-raahx-orange rounded-t-sm" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-2">
        {panels[activeTab]}
      </div>
    </div>
  );
};

export const Tab = ({ label }) => {
  return null;
};

export const TabPanel = ({ children }) => {
  return <div className="animate-in fade-in duration-300">{children}</div>;
};
