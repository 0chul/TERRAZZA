import React from 'react';

interface InfoCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  colorClass?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, subValue, icon }) => {
  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(201, 150, 58, 0.15)',
      borderRadius: '16px',
      padding: '24px'
    }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{color: 'var(--mist)'}}>{title}</h3>
        <div style={{color: 'var(--amber)'}}>{icon}</div>
      </div>
      <div className="text-2xl font-bold" style={{color: 'var(--cream)'}}>{value}</div>
      {subValue && <div className="text-xs mt-2" style={{color: 'var(--stone)'}}>{subValue}</div>}
    </div>
  );
};