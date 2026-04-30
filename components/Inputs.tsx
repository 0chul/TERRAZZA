import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, unit, step = 1 }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Sync internal state with prop value when not focused to show formatted value
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toLocaleString());
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // On focus, show raw number for easier editing
    setInputValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    // On blur, re-format
    setInputValue(value.toLocaleString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    
    // Remove commas for parsing
    const clean = raw.replace(/,/g, '');
    
    if (clean === '' || clean === '-') {
      onChange(0);
      return;
    }
    
    const num = Number(clean);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(value + step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(value - step);
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color: 'var(--mist)'}}>{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          className="w-full p-2 pr-12 rounded-md outline-none text-right font-mono transition-colors"
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--cream)',
            border: `1px solid ${isFocused ? 'var(--amber)' : 'rgba(201,150,58,0.2)'}`,
            boxShadow: isFocused ? '0 0 0 1px var(--amber)' : 'none'
          }}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="0"
        />
        {unit && <span className="absolute right-3 top-2.5 text-sm pointer-events-none" style={{color: 'var(--stone)'}}>{unit}</span>}
      </div>
    </div>
  );
};

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
        <label className="text-xs font-semibold uppercase tracking-wide" style={{color: 'var(--mist)'}}>{label}</label>
        <span className="text-sm font-bold px-2 py-0.5 rounded border min-w-[3rem] text-center tabular-nums" style={{color: 'var(--amber)', background: 'rgba(201,150,58,0.1)', borderColor: 'rgba(201,150,58,0.3)'}}>
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none"
        style={{
          background: 'rgba(201,150,58,0.2)',
          accentColor: 'var(--amber)'
        }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="flex justify-between text-[10px] mt-1 px-1" style={{color: 'var(--stone)'}}>
        <span>{Math.round(min * 100)}%</span>
        <span>{Math.round(max * 100)}%</span>
      </div>
    </div>
  );
};