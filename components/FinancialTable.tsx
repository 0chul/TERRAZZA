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
            <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 border-r border-gray-200 whitespace-nowrap z-10">구분 (단위:원)</th>
            {data.map((row) => (
              <th key={row.month} className="px-4 py-3 min-w-[100px]">M+{row.month}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {/* Total Revenue */}
          <tr>
            <td className="px-4 py-3 text-left font-bold text-blue-900 sticky left-0 bg-blue-50 border-r border-blue-200 whitespace-nowrap z-10">매출 합계 (Total)</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-3 text-blue-700 font-bold bg-blue-50/30">{formatCurrency(row.revenue)}</td>
            ))}
          </tr>

          {/* Breakdown Rows */}
          <tr className="group hover:bg-gray-50">
            <td className="px-4 py-2 text-left text-xs text-gray-500 pl-6 border-r border-gray-200 sticky left-0 bg-white whitespace-nowrap z-10">└ 카페 (Cafe)</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-2 text-gray-500 text-xs">{formatCurrency(row.cafeRevenue)}</td>
            ))}
          </tr>
          <tr className="group hover:bg-gray-50">
            <td className="px-4 py-2 text-left text-xs text-gray-500 pl-6 border-r border-gray-200 sticky left-0 bg-white whitespace-nowrap z-10">└ 공간대여 (Space)</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-2 text-gray-500 text-xs">{formatCurrency(row.spaceRevenue)}</td>
            ))}
          </tr>
          <tr className="group hover:bg-gray-50">
            <td className="px-4 py-2 text-left text-xs text-gray-500 pl-6 border-r border-gray-200 sticky left-0 bg-white whitespace-nowrap z-10">└ 와인바 (Wine)</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-2 text-gray-500 text-xs">{formatCurrency(row.wineRevenue)}</td>
            ))}
          </tr>

          <tr>
            <td className="px-4 py-3 text-left sticky left-0 bg-white border-r border-gray-200 text-gray-500 whitespace-nowrap z-10">원가 (재료비)</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-3 text-red-400">-{formatCurrency(row.cogs)}</td>
            ))}
          </tr>
          <tr className="bg-gray-50/50">
            <td className="px-4 py-3 text-left font-medium sticky left-0 bg-gray-50 border-r border-gray-200 whitespace-nowrap z-10">매출총이익</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-3 font-medium">{formatCurrency(row.grossProfit)}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-3 text-left sticky left-0 bg-white border-r border-gray-200 text-gray-500 whitespace-nowrap z-10">고정비 합계 (인건/운영)</td>
            {data.map((row) => (
              <td key={row.month} className="px-4 py-3 text-red-400">-{formatCurrency(row.fixedCosts)}</td>
            ))}
          </tr>
          <tr className="bg-blue-50/50 border-t-2 border-blue-100">
            <td className="px-4 py-3 text-left font-bold text-blue-900 sticky left-0 bg-blue-50 border-r border-blue-200 whitespace-nowrap z-10">순이익</td>
            {data.map((row) => (
              <td key={row.month} className={`px-4 py-3 font-bold ${row.netProfit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                {formatCurrency(row.netProfit)}
              </td>
            ))}
          </tr>
          <tr className="bg-gray-100/50">
             <td className="px-4 py-3 text-left font-bold text-gray-700 sticky left-0 bg-gray-100 border-r border-gray-200 whitespace-nowrap z-10">누적 손익 (BEP)</td>
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