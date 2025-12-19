
import React from 'react';
import { Scenario, GlobalConfig } from '../types';
import { BarChart2, TrendingUp, DollarSign, Wallet } from 'lucide-react';

interface ComparisonTabProps {
  scenarios: Scenario[];
  calculateFinancials: (config: GlobalConfig) => {
    totalRevenue: number;
    netProfit: number;
    totalInvestment: number;
  };
}

export const ComparisonTab: React.FC<ComparisonTabProps> = ({ scenarios, calculateFinancials }) => {
  if (scenarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
        <BarChart2 size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">저장된 시나리오가 없습니다.</h3>
        <p className="text-sm text-gray-500 mt-1">'계획 설정' 탭에서 현재 설정을 시나리오로 저장해 보세요.</p>
      </div>
    );
  }

  const scenarioResults = scenarios.map(s => ({
    name: s.name,
    results: calculateFinancials(s.config),
    timestamp: s.timestamp
  }));

  const formatKrw = (val: number) => `₩${Math.round(val / 10000).toLocaleString()}만`;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="text-blue-600" />
          <h2 className="text-xl font-bold">시나리오별 비교 분석</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-4 py-4 text-left font-bold text-gray-600">시나리오 이름</th>
                <th className="px-4 py-4 text-right font-bold text-gray-600">월 매출 합계</th>
                <th className="px-4 py-4 text-right font-bold text-gray-600">월 순이익</th>
                <th className="px-4 py-4 text-right font-bold text-gray-600">수익률</th>
                <th className="px-4 py-4 text-right font-bold text-gray-600">초기 투자금</th>
                <th className="px-4 py-4 text-right font-bold text-gray-600">예상 BEP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {scenarioResults.map((res, idx) => {
                const margin = (res.results.netProfit / res.results.totalRevenue) * 100;
                const bepMonths = res.results.netProfit > 0 
                  ? Math.ceil(res.results.totalInvestment / res.results.netProfit)
                  : Infinity;

                return (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-5 font-bold text-gray-900">{res.name}</td>
                    <td className="px-4 py-5 text-right text-gray-700 font-medium">{formatKrw(res.results.totalRevenue)}</td>
                    <td className="px-4 py-5 text-right font-bold text-green-600">{formatKrw(res.results.netProfit)}</td>
                    <td className="px-4 py-5 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${margin > 20 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right text-gray-500">{formatKrw(res.results.totalInvestment)}</td>
                    <td className="px-4 py-5 text-right font-mono font-bold text-blue-600">
                      {bepMonths === Infinity ? '측정불가' : `M+${bepMonths}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp size={18} />
            <span className="text-xs font-bold uppercase">최고 매출</span>
          </div>
          <div className="text-xl font-bold">
            {scenarioResults.sort((a,b) => b.results.totalRevenue - a.results.totalRevenue)[0].name}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <DollarSign size={18} />
            <span className="text-xs font-bold uppercase">최고 순이익</span>
          </div>
          <div className="text-xl font-bold">
            {scenarioResults.sort((a,b) => b.results.netProfit - a.results.netProfit)[0].name}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Wallet size={18} />
            <span className="text-xs font-bold uppercase">최단기 BEP</span>
          </div>
          <div className="text-xl font-bold">
            {scenarioResults.sort((a,b) => (a.results.totalInvestment/a.results.netProfit) - (b.results.totalInvestment/b.results.netProfit))[0].name}
          </div>
        </div>
      </div>
    </div>
  );
};
