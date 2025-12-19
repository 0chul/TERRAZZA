
import React, { useMemo } from 'react';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Calculator,
  PieChart as PieChartIcon,
  Sparkles,
  Loader2,
  FileText
} from 'lucide-react';
import { MonthlyData, BusinessReport } from '../types';
import { InfoCard } from './InfoCard';
import { FinancialTable } from './FinancialTable';

const CHART_COLORS = {
  revenue: { cafe: '#1e3a8a', space: '#2563eb', wine: '#60a5fa' },
  cost: { labor: '#7f1d1d', cafe: '#b91c1c', wine: '#ef4444', utility: '#f87171', fixed: '#fca5a5' },
  profit: '#111827'
};

interface DashboardTabProps {
  monthlyData: MonthlyData[];
  totalInvestment: number;
  bepMonth: string;
  onGenerateReport: () => void;
  isGenerating: boolean;
  report: BusinessReport | null;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ 
  monthlyData, 
  totalInvestment, 
  bepMonth,
  onGenerateReport,
  isGenerating,
  report
}) => {
  const mainChartData = useMemo(() => {
    return monthlyData.map(d => ({
      ...d,
      cafeCOGS: -d.cafeCOGS,
      wineCOGS: -d.wineCOGS,
      laborCost: -d.laborCost,
      utilityCost: -d.utilityCost,
      otherFixedCost: -d.otherFixedCost,
    }));
  }, [monthlyData]);

  const pieChartData = useMemo(() => {
    const current = monthlyData[0];
    if (!current) return { revenue: [], cost: [] };
    const revenue = [
      { name: '카페 매출', value: current.cafeRevenue, color: CHART_COLORS.revenue.cafe },
      { name: '공간대여 매출', value: current.spaceRevenue, color: CHART_COLORS.revenue.space },
      { name: '와인바 매출', value: current.wineRevenue, color: CHART_COLORS.revenue.wine },
    ].filter(d => d.value > 0);
    const cost = [
      { name: '카페 재료비', value: current.cafeCOGS, color: CHART_COLORS.cost.cafe },
      { name: '와인 재료비', value: current.wineCOGS, color: CHART_COLORS.cost.wine },
      { name: '인건비', value: current.laborCost, color: CHART_COLORS.cost.labor },
      { name: '공과금', value: current.utilityCost, color: CHART_COLORS.cost.utility },
      { name: '기타 고정비', value: current.otherFixedCost, color: CHART_COLORS.cost.fixed },
    ].filter(d => d.value > 0);
    return { revenue, cost };
  }, [monthlyData]);

  const { totalRevenue, totalCost } = useMemo(() => {
    const r = pieChartData.revenue.reduce((acc, cur) => acc + cur.value, 0);
    const c = pieChartData.cost.reduce((acc, cur) => acc + cur.value, 0);
    return { totalRevenue: r, totalCost: c };
  }, [pieChartData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard title="월 예상 매출" value={`₩${Math.round(totalRevenue / 10000).toLocaleString()}만`} subValue="3가지 사업 합산" icon={<TrendingUp className="text-blue-500" />} />
        <InfoCard title="월 예상 순이익" value={`₩${Math.round((monthlyData[0]?.netProfit || 0) / 10000).toLocaleString()}만`} subValue={`마진율 ${totalRevenue ? Math.round((monthlyData[0].netProfit / totalRevenue) * 100) : 0}%`} icon={<DollarSign className="text-green-500" />} />
        <InfoCard title="초기 투자비용" value={`₩${Math.round(totalInvestment / 10000).toLocaleString()}만`} subValue="건물주 직영 (보증금 제외)" icon={<Calculator className="text-purple-500" />} />
        <InfoCard title="손익분기점 (BEP)" value={bepMonth} subValue={bepMonth !== '미도달' ? '누적 수익 전환 시점' : '10개월 내 달성 불가'} icon={<AlertCircle className="text-orange-500" />} />
      </div>

      {/* AI Strategy Report Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-1 rounded-2xl shadow-lg transition-all hover:shadow-xl">
        <div className="bg-white rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={24} className="text-amber-500" /> AI 사업 전략 보고서
              </h2>
              <p className="text-sm text-gray-500 mt-1">Gemini AI가 현재 설정값을 기반으로 비즈니스 모델을 분석합니다.</p>
            </div>
            <button 
              onClick={onGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {report ? '보고서 갱신하기' : 'AI 전략 리포트 생성'}
            </button>
          </div>

          {report ? (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 relative">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Generated at {report.timestamp}
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {report.content}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-100 rounded-xl p-12 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-400 text-sm">리포트 생성 버튼을 눌러 AI 컨설팅을 시작하세요.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><PieChartIcon size={20} className="text-blue-600"/> 매출 구성</h2></div>
           <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData.revenue} cx="50%" cy="50%" labelLine={false} outerRadius={90} innerRadius={40} fill="#8884d8" dataKey="value" nameKey="name">
                    {pieChartData.revenue.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`₩${Math.round(value).toLocaleString()}`, name]} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 text-right bg-white/90 p-2 rounded-lg border border-blue-100 shadow-sm"><div className="text-xs text-gray-500">Total</div><div className="text-lg font-bold text-blue-900">₩{Math.round(totalRevenue / 10000).toLocaleString()}만</div></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><PieChartIcon size={20} className="text-red-600"/> 비용 구조</h2></div>
           <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData.cost} cx="50%" cy="50%" labelLine={false} outerRadius={90} innerRadius={40} fill="#8884d8" dataKey="value" nameKey="name">
                    {pieChartData.cost.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`₩${Math.round(value).toLocaleString()}`, name]} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 text-right bg-white/90 p-2 rounded-lg border border-red-100 shadow-sm"><div className="text-xs text-gray-500">Total</div><div className="text-lg font-bold text-red-900">₩{Math.round(totalCost / 10000).toLocaleString()}만</div></div>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold text-gray-800">BEP 시점 및 수익 추이 (10개월)</h2></div>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tickFormatter={(val) => `M+${val}`} stroke="#9CA3AF" />
              <YAxis yAxisId="left" stroke="#9CA3AF" tickFormatter={(val) => `${val / 10000}만`} />
              <Tooltip formatter={(value: number, name: string) => name === '누적 손익' ? [`₩${Math.round(value).toLocaleString()}`, name] : [`₩${Math.abs(Math.round(value)).toLocaleString()}`, name]} />
              <Legend verticalAlign="bottom" height={36} content={() => (<div className="flex justify-center gap-6 mt-4 text-xs text-gray-700"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600"></div><span>매출</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600"></div><span>비용</span></div><div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-black"></div><span>누적 손익</span></div></div>)} />
              <ReferenceLine yAxisId="left" y={0} stroke="#000" strokeDasharray="3 3" />
              <Bar yAxisId="left" dataKey="cafeRevenue" stackId="revenue" fill={CHART_COLORS.revenue.cafe} barSize={20} />
              <Bar yAxisId="left" dataKey="spaceRevenue" stackId="revenue" fill={CHART_COLORS.revenue.space} barSize={20} />
              <Bar yAxisId="left" dataKey="wineRevenue" stackId="revenue" fill={CHART_COLORS.revenue.wine} barSize={20} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="laborCost" stackId="cost" fill={CHART_COLORS.cost.labor} barSize={20} />
              <Bar yAxisId="left" dataKey="cafeCOGS" stackId="cost" fill={CHART_COLORS.cost.cafe} barSize={20} />
              <Bar yAxisId="left" dataKey="wineCOGS" stackId="cost" fill={CHART_COLORS.cost.wine} barSize={20} />
              <Bar yAxisId="left" dataKey="utilityCost" stackId="cost" fill={CHART_COLORS.cost.utility} barSize={20} />
              <Bar yAxisId="left" dataKey="otherFixedCost" stackId="cost" fill={CHART_COLORS.cost.fixed} barSize={20} radius={[0, 0, 4, 4]} />
              <Line yAxisId="left" type="monotone" dataKey="cumulativeProfit" name="누적 손익" stroke={CHART_COLORS.profit} strokeWidth={3} dot={{ r: 3, fill: CHART_COLORS.profit }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

       <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">월간 재무 상세 (Monthly P&L)</h3>
        <FinancialTable data={monthlyData} />
      </div>
    </div>
  );
};
