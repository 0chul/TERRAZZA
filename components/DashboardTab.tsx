
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
  FileText
} from 'lucide-react';
import { MonthlyData } from '../types';
import { InfoCard } from './InfoCard';
import { FinancialTable } from './FinancialTable';

const CHART_COLORS = {
  revenue: { cafe: '#795548', space: '#fb8c00', wine: '#bf360c' },
  cost: { labor: '#5d4037', cafe: '#8d6e63', wine: '#a1887f', utility: '#d7ccc8', fixed: '#efebe9' },
  profit: '#3e2723'
};

interface DashboardTabProps {
  monthlyData: MonthlyData[];
  totalInvestment: number;
  bepMonth: string;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ 
  monthlyData, 
  totalInvestment, 
  bepMonth,
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
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard title="월 예상 총 매출" value={`₩${Math.round(totalRevenue / 10000).toLocaleString()}만`} subValue="사업부별 합산 결과" icon={<TrendingUp className="text-orange-600" />} />
        <InfoCard title="월 예상 순수익" value={`₩${Math.round((monthlyData[0]?.netProfit || 0) / 10000).toLocaleString()}만`} subValue={`영업이익률 ${totalRevenue ? Math.round((monthlyData[0].netProfit / totalRevenue) * 100) : 0}%`} icon={<DollarSign className="text-orange-800" />} />
        <InfoCard title="초기 투자 예산" value={`₩${Math.round(totalInvestment / 10000).toLocaleString()}만`} subValue="시설 및 집기류 포함" icon={<Calculator className="text-brown-500" />} />
        <InfoCard title="회수 시점 (BEP)" value={bepMonth} subValue={bepMonth !== '측정 불가' ? '수익 전환 예상 시점' : '운영 전략 재검토 권장'} icon={<AlertCircle className="text-orange-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
           <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-[#5d4037] flex items-center gap-2"><PieChartIcon size={20} className="text-orange-600"/> 매출 비중</h2></div>
           <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData.revenue} cx="50%" cy="50%" labelLine={false} outerRadius={90} innerRadius={40} fill="#8884d8" dataKey="value" nameKey="name">
                    {pieChartData.revenue.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`₩${Math.round(value).toLocaleString()}`, name]} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '11px'}}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 text-right bg-orange-50/50 p-2 rounded-lg border border-orange-100 shadow-sm"><div className="text-[10px] text-orange-600 font-bold uppercase">Total Revenue</div><div className="text-lg font-bold text-[#5d4037]">₩{Math.round(totalRevenue / 10000).toLocaleString()}만</div></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
           <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-[#5d4037] flex items-center gap-2"><PieChartIcon size={20} className="text-orange-800"/> 지출 구조</h2></div>
           <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData.cost} cx="50%" cy="50%" labelLine={false} outerRadius={90} innerRadius={40} fill="#8884d8" dataKey="value" nameKey="name">
                    {pieChartData.cost.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`₩${Math.round(value).toLocaleString()}`, name]} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '11px'}}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 text-right bg-orange-50/50 p-2 rounded-lg border border-orange-100 shadow-sm"><div className="text-[10px] text-orange-600 font-bold uppercase">Total Costs</div><div className="text-lg font-bold text-[#5d4037]">₩{Math.round(totalCost / 10000).toLocaleString()}만</div></div>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
        <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold text-[#5d4037]">수익 추이 및 BEP 분석 (12개월 전망)</h2></div>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f9f2ed" />
              <XAxis dataKey="month" tickFormatter={(val) => `M+${val}`} stroke="#8d6e63" />
              <YAxis yAxisId="left" stroke="#8d6e63" tickFormatter={(val) => `${val / 10000}만`} />
              <Tooltip formatter={(value: number, name: string) => name === '누적 손익' ? [`₩${Math.round(value).toLocaleString()}`, name] : [`₩${Math.abs(Math.round(value)).toLocaleString()}`, name]} />
              <Legend verticalAlign="bottom" height={36} content={() => (<div className="flex justify-center gap-6 mt-4 text-[11px] font-bold text-[#5d4037]"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-600"></div><span>매출원</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#d7ccc8]"></div><span>지출원</span></div><div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-[#3e2723]"></div><span>누적 자산 추이</span></div></div>)} />
              <ReferenceLine yAxisId="left" y={0} stroke="#5d4037" strokeDasharray="3 3" />
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
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#5d4037] flex items-center gap-2">
            <FileText className="text-orange-600" size={24} /> 
            월간 재무 리포트 상세
          </h3>
          <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">Currency: KRW</span>
        </div>
        <FinancialTable data={monthlyData} />
      </div>
    </div>
  );
};
