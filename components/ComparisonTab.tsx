
import React, { useMemo } from 'react';
import { Scenario, GlobalConfig } from '../types';
import { BarChart2, TrendingUp, DollarSign, Wallet, ArrowRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ComparisonTabProps {
  scenarios: Scenario[];
  calculateFinancials: (config: GlobalConfig) => {
    totalRevenue: number;
    netProfit: number;
    totalInvestment: number;
  };
}

export const ComparisonTab: React.FC<ComparisonTabProps> = ({ scenarios, calculateFinancials }) => {
  const scenarioResults = useMemo(() => {
    return scenarios.map(s => ({
      name: s.name,
      ...calculateFinancials(s.config),
      margin: 0,
      bep: 0
    })).map(res => ({
      ...res,
      margin: (res.netProfit / res.totalRevenue) * 100,
      bep: res.netProfit > 0 ? res.totalInvestment / res.netProfit : 99 // Cap at 99 for chart
    }));
  }, [scenarios, calculateFinancials]);

  if (scenarios.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
        <div className="bg-slate-50 p-6 rounded-full mb-6">
          <BarChart2 size={48} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">시나리오 비교를 위해 2개 이상의 계획을 저장해주세요.</h3>
        <p className="text-slate-500 mt-2 text-center max-w-md">
          '상세 설정' 탭에서 여러 수치를 변경한 후 상단 바의 <b>저장</b> 버튼을 눌러 시나리오를 추가할 수 있습니다.
        </p>
      </div>
    );
  }

  const formatKrw = (val: number) => `₩${Math.round(val / 10000).toLocaleString()}만`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profit Comparison Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={20} /> 계획별 월 예상 순이익 비교
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioResults} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl">
                          <p className="font-bold mb-1">{payload[0].payload.name}</p>
                          <p className="text-emerald-400">순이익: {formatKrw(payload[0].value as number)}</p>
                        </div>
                      )
                    }
                    return null;
                  }}
                />
                <Bar dataKey="netProfit" radius={[8, 8, 0, 0]} barSize={40}>
                  {scenarioResults.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.netProfit > 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BEP Comparison Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Wallet className="text-indigo-500" size={20} /> 예상 투자금 회수 기간 (개월)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioResults} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl">
                          <p className="font-bold mb-1">{payload[0].payload.name}</p>
                          <p className="text-indigo-400">회수기간: {payload[0].value === 99 ? '측정불가' : `${Math.ceil(payload[0].value as number)}개월`}</p>
                        </div>
                      )
                    }
                    return null;
                  }}
                />
                <Bar dataKey="bep" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 className="text-indigo-600" /> 상세 데이터 비교
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left font-bold text-slate-500 uppercase tracking-wider">계획 이름</th>
                <th className="px-6 py-5 text-right font-bold text-slate-500 uppercase tracking-wider">월 매출</th>
                <th className="px-6 py-5 text-right font-bold text-slate-500 uppercase tracking-wider">월 순이익</th>
                <th className="px-6 py-5 text-center font-bold text-slate-500 uppercase tracking-wider">수익률</th>
                <th className="px-6 py-5 text-right font-bold text-slate-500 uppercase tracking-wider">투자금</th>
                <th className="px-8 py-5 text-right font-bold text-slate-500 uppercase tracking-wider">회수 시점</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scenarioResults.map((res, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{res.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Scenario #{idx + 1}</div>
                  </td>
                  <td className="px-6 py-6 text-right text-slate-700 font-semibold">{formatKrw(res.totalRevenue)}</td>
                  <td className="px-6 py-6 text-right font-black text-emerald-600">{formatKrw(res.netProfit)}</td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${res.margin > 25 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {res.margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right text-slate-500">{formatKrw(res.totalInvestment)}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="inline-flex items-center gap-1.5 font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">
                      <TrendingUp size={14} />
                      {res.netProfit > 0 ? `M+${Math.ceil(res.totalInvestment / res.netProfit)}` : '측정불가'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: '최대 수익 계획', value: scenarioResults.sort((a,b) => b.netProfit - a.netProfit)[0].name, icon: <DollarSign className="text-emerald-500"/>, bg: 'bg-emerald-50' },
          { label: '최고 마진율', value: scenarioResults.sort((a,b) => b.margin - a.margin)[0].name, icon: <TrendingUp className="text-amber-500"/>, bg: 'bg-amber-50' },
          { label: '최단기 BEP', value: scenarioResults.sort((a,b) => a.bep - b.bep)[0].name, icon: <Wallet className="text-indigo-500"/>, bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-3xl border border-slate-200 ${stat.bg} shadow-sm flex items-center justify-between`}>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-lg font-bold text-slate-900">{stat.value}</div>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm">{stat.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
