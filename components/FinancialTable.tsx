
import React, { useState } from 'react';
import { MonthlyData } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FinancialTableProps {
  data: MonthlyData[];
}

interface RowProps {
  label: string;
  values: number[];
  isHeader?: boolean;
  isSubItem?: boolean;
  isTotal?: boolean;
  isProfit?: boolean;
  isCumulative?: boolean;
  hasChildren?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  formatType?: 'default' | 'negative' | 'profit' | 'cumulative';
}

const TableRow: React.FC<RowProps> = ({
  label,
  values,
  isHeader = false,
  isSubItem = false,
  isProfit = false,
  isCumulative = false,
  hasChildren = false,
  isOpen = false,
  onToggle,
  formatType = 'default'
}) => {
  const formatValue = (val: number) => {
    const formatted = Math.round(val).toLocaleString();
    if (formatType === 'negative') return `-${formatted}`;
    if (formatType === 'profit' || formatType === 'cumulative') {
        return val >= 0 ? `+${formatted}` : formatted;
    }
    return formatted;
  };

  const getRowClass = () => {
    if (isProfit) return "font-bold border-t-2 border-[rgba(201,150,58,0.3)] bg-[rgba(201,150,58,0.05)] hover:bg-[rgba(201,150,58,0.1)]";
    if (isCumulative) return "font-bold bg-[var(--amber)] text-[var(--bg-primary)]";
    if (isHeader) return "bg-[rgba(201,150,58,0.02)] hover:bg-[rgba(201,150,58,0.05)] font-bold text-[var(--cream)] border-t border-[rgba(201,150,58,0.1)]";
    if (isSubItem) return "bg-transparent hover:bg-[rgba(201,150,58,0.03)] text-xs text-[var(--stone)] italic";
    return "bg-transparent hover:bg-[rgba(201,150,58,0.05)] text-[var(--mist)] border-t border-[rgba(201,150,58,0.05)]";
  };

  const getValueClass = (val: number) => {
    if (isCumulative) return val >= 0 ? "text-[var(--bg-primary)]" : "text-rose-900";
    if (isProfit) return val >= 0 ? "text-[var(--amber)]" : "text-rose-500";
    if (formatType === 'negative') return "text-rose-400";
    return "";
  };

  return (
    <tr className={`${getRowClass()} transition-colors group`}>
      <td 
        className={`px-4 py-3 text-left sticky left-0 z-20 whitespace-nowrap border-r border-[rgba(201,150,58,0.1)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] ${isCumulative ? 'bg-[var(--amber)]' : (isHeader ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-primary)]')}`}
        onClick={onToggle}
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
      >
        <div className={`flex items-center ${isSubItem ? 'pl-8' : 'pl-1'}`}>
          {hasChildren && (
            <span className="mr-2 text-[var(--amber)] group-hover:text-[var(--amber-light)] opacity-70">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          <span>{label}</span>
        </div>
      </td>
      {values.map((val, idx) => (
        <td key={idx} className={`px-4 py-3 text-right whitespace-nowrap font-mono ${getValueClass(val)}`}>
          {formatValue(val)}
        </td>
      ))}
    </tr>
  );
};

export const FinancialTable: React.FC<FinancialTableProps> = ({ data }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    revenue: true,
    cogs: false,
    fixed: false
  });

  const toggle = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(201,150,58,0.1)] shadow-sm bg-[var(--bg-primary)]">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--bg-card)] text-[var(--mist)] font-bold text-[11px] uppercase tracking-wider border-b border-[rgba(201,150,58,0.1)]">
              <th className="px-4 py-4 text-left sticky left-0 bg-[var(--bg-card)] z-30 border-r border-[rgba(201,150,58,0.1)] min-w-[180px]">항목 구분</th>
              {data.map(row => (
                <th key={row.month} className="px-4 py-4 text-right min-w-[110px]">M+{row.month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableRow 
              label="총 매출 (Total Revenue)" 
              values={data.map(d => d.revenue)} 
              isHeader 
              hasChildren 
              isOpen={expanded.revenue} 
              onToggle={() => toggle('revenue')}
            />
            {expanded.revenue && (
              <>
                <TableRow label="└ 카페 매출" values={data.map(d => d.cafeRevenue)} isSubItem />
                <TableRow label="└ 공간대여 매출" values={data.map(d => d.spaceRevenue)} isSubItem />
                <TableRow label="└ 와인바 매출" values={data.map(d => d.wineRevenue)} isSubItem />
              </>
            )}

            <TableRow 
              label="총 매출원가 (COGS)" 
              values={data.map(d => d.cogs)} 
              isHeader 
              hasChildren 
              isOpen={expanded.cogs} 
              onToggle={() => toggle('cogs')}
              formatType="negative"
            />
            {expanded.cogs && (
              <>
                <TableRow label="└ 카페 재료비" values={data.map(d => d.cafeCOGS)} isSubItem formatType="negative" />
                <TableRow label="└ 와인바 원가" values={data.map(d => d.wineCOGS)} isSubItem formatType="negative" />
              </>
            )}

            <TableRow 
              label="총 고정비 (Fixed Costs)" 
              values={data.map(d => d.fixedCosts)} 
              isHeader 
              hasChildren 
              isOpen={expanded.fixed} 
              onToggle={() => toggle('fixed')}
              formatType="negative"
            />
            {expanded.fixed && (
              <>
                <TableRow label="└ 인건비 합계" values={data.map(d => d.laborCost)} isSubItem formatType="negative" />
                <TableRow label="└ 공과금" values={data.map(d => d.utilityCost)} isSubItem formatType="negative" />
                <TableRow label="└ 기타 운영비" values={data.map(d => d.otherFixedCost)} isSubItem formatType="negative" />
              </>
            )}

            <TableRow 
              label="당월 순이익 (Net Profit)" 
              values={data.map(d => d.netProfit)} 
              isProfit 
              formatType="profit"
            />

            <TableRow 
              label="누적 손익 (Cumulative)" 
              values={data.map(d => d.cumulativeProfit)} 
              isCumulative 
              formatType="cumulative"
            />
          </tbody>
        </table>
      </div>
      <div className="bg-[var(--bg-card)] px-4 py-2 border-t border-[rgba(201,150,58,0.1)] text-[10px] text-[var(--stone)] flex justify-between italic">
        <span>* 항목명을 클릭하면 세부 데이터 확인이 가능합니다.</span>
        <span>Terrazza Lounge Financial System v1.2</span>
      </div>
    </div>
  );
};
