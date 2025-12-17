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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-800 flex-shrink-0">{title}</span>
        <div className="flex items-center gap-4">
          {summary && (
            <div className="text-right hidden sm:block">
              {summary}
            </div>
          )}
          {isOpen ? <ChevronUp size={20} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-500 flex-shrink-0" />}
        </div>
      </button>
      {isOpen && <div className="p-6 border-t border-gray-200">{children}</div>}
    </div>
  );
};