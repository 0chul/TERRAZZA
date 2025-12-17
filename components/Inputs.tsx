import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, unit, step = 1 }) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
    <div className="relative">
      <input
        type="number"
        className="w-full p-2 pr-8 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-right font-mono"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
      />
      {unit && <span className="absolute right-3 top-2 text-gray-400 text-sm">{unit}</span>}
    </div>
  </div>
);

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const SliderInput: React.FC<SliderInputProps> = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 min-w-[3rem] text-center tabular-nums">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
        <span>{Math.round(min * 100)}%</span>
        <span>{Math.round(max * 100)}%</span>
      </div>
    </div>
  );
};