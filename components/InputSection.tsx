import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InputSectionProps {
  title: string;
  children: React.ReactNode;
  isOpenDefault?: boolean;
  summary?: React.ReactNode;
}

export const InputSection: React.FC<InputSectionProps> = ({ title, children, isOpenDefault = false, summary }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(201, 150, 58, 0.15)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '16px'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between transition-colors"
        style={{ background: 'rgba(201, 150, 58, 0.05)' }}
      >
        <span className="font-semibold flex-shrink-0 text-white">{title}</span>
        <div className="flex items-center gap-4">
          {summary && (
            <div className="text-right hidden sm:block">
              {summary}
            </div>
          )}
          {isOpen ? <ChevronUp size={20} style={{color: 'var(--mist)'}} className="flex-shrink-0" /> : <ChevronDown size={20} style={{color: 'var(--mist)'}} className="flex-shrink-0" />}
        </div>
      </button>
      {isOpen && <div className="p-6 border-t" style={{ borderColor: 'rgba(201, 150, 58, 0.1)' }}>{children}</div>}
    </div>
  );
};
