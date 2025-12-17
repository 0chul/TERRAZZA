import React from 'react';
import { MonthlyData } from '../types';

interface FinancialTableProps {
  data: MonthlyData[];
}

export const FinancialTable: React.FC<FinancialTableProps> = ({ data }) => {
  const formatCurrency = (val: number) => Math.round(val).toLocaleString();

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="w-full text-sm text-right">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 border-r border-gray-200 w-32">구분 (단위:원)</th>
            {data.map((row) => (
              <th key={row.month} className="px-4 py-3 min-w-[100px]">M+{row.month}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="px-4 py-3 text-left font-medium sticky left-0 bg-white border-r border-gray-200">매출 합계</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-3 text-blue-600 font-semibold">{formatCurrency(row.revenue)}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-3 text-left sticky left-0 bg-white border-r border-gray-200 text-gray-500">원가 (재료비)</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-3 text-red-400">-{formatCurrency(row.cogs)}</td>
            ))}
          </tr>
          <tr className="bg-gray-50/50">
            <td className="px-4 py-3 text-left font-medium sticky left-0 bg-gray-50 border-r border-gray-200">매출총이익</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-3 font-medium">{formatCurrency(row.grossProfit)}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-3 text-left sticky left-0 bg-white border-r border-gray-200 text-gray-500">고정비 (임대/인건)</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-3 text-red-400">-{formatCurrency(row.fixedCosts)}</td>
            ))}
          </tr>
          <tr className="bg-blue-50/50 border-t-2 border-blue-100">
            <td className="px-4 py-3 text-left font-bold text-blue-900 sticky left-0 bg-blue-50 border-r border-blue-200">순이익</td>
            {data.map((row) => (
              <td key={row.month} className={`px-4 py-3 font-bold ${row.netProfit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                {formatCurrency(row.netProfit)}
              </td>
            ))}
          </tr>
          <tr className="bg-gray-100/50">
             <td className="px-4 py-3 text-left font-bold text-gray-700 sticky left-0 bg-gray-100 border-r border-gray-200">누적 손익 (BEP)</td>
             {data.map((row) => (
              <td key={row.month} className={`px-4 py-3 font-bold ${row.cumulativeProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(row.cumulativeProfit)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};