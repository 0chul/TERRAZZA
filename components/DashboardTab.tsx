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
  PieChart as PieChartIcon
} from 'lucide-react';
import { MonthlyData } from '../types';
import { InfoCard } from './InfoCard';
import { FinancialTable } from './FinancialTable';

const CHART_COLORS = {
  revenue: {
    cafe: '#1e3a8a',   // Indigo 900
    space: '#2563eb',  // Blue 600
    wine: '#60a5fa',   // Blue 400
  },
  cost: {
    labor: '#7f1d1d',  // Red 900
    cafe: '#b91c1c',   // Red 700
    wine: '#ef4444',   // Red 500
    utility: '#f87171', // Red 400
    fixed: '#fca5a5',   // Red 300
  },
  profit: '#111827'
};

interface DashboardTabProps {
  monthlyData: MonthlyData[];
  totalInvestment: number;
  bepMonth: string;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ monthlyData, totalInvestment, bepMonth }) => {
  // Chart Data (Negative costs for downward bars in the main chart)
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

  // Pie Chart Data (Based on Month 1 - assuming consistent monthly structure)
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

  // Calculate Totals for Center Display
  const { totalRevenue, totalCost } = useMemo(() => {
    const r = pieChartData.revenue.reduce((acc, cur) => acc + cur.value, 0);
    const c = pieChartData.cost.reduce((acc, cur) => acc + cur.value, 0);
    return { totalRevenue: r, totalCost: c };
  }, [pieChartData]);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          title="월 예상 매출"
          value={`₩${Math.round((monthlyData[0]?.revenue || 0) / 10000).toLocaleString()}만`}
          subValue="3가지 사업 합산"
          icon={<TrendingUp className="text-blue-500" />}
        />
        <InfoCard
          title="월 예상 순이익"
          value={`₩${Math.round((monthlyData[0]?.netProfit || 0) / 10000).toLocaleString()}만`}
          subValue={`마진율 ${monthlyData[0]?.revenue ? Math.round((monthlyData[0].netProfit / monthlyData[0].revenue) * 100) : 0}%`}
          icon={<DollarSign className="text-green-500" />}
        />
        <InfoCard
          title="초기 투자비용"
          value={`₩${Math.round(totalInvestment / 10000).toLocaleString()}만`}
          subValue="건물주 직영 (보증금/임대료 제외)"
          icon={<Calculator className="text-purple-500" />}
        />
        <InfoCard
          title="손익분기점 (BEP)"
          value={bepMonth}
          subValue={bepMonth !== '미도달' ? '누적 수익 전환 시점' : '10개월 내 달성 불가'}
          icon={<AlertCircle className="text-orange-500" />}
        />
      </div>

      {/* Pie Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <PieChartIcon size={20} className="text-blue-600"/> 매출 구성 (Revenue Mix)
              </h2>
           </div>
           <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData.revenue}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieChartData.revenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`₩${Math.round(value).toLocaleString()}`, name]}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}}/>
                </PieChart>
              </ResponsiveContainer>
              {/* Top Right Total Text */}
              <div className="absolute top-0 right-0 pointer-events-none">
                  <div className="text-right bg-white/90 p-2 rounded-lg border border-blue-100 shadow-sm backdrop-blur-sm">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-lg font-bold text-blue-900">
                      ₩{Math.round(totalRevenue / 10000).toLocaleString()}만
                    </div>
                  </div>
              </div>
           </div>
        </div>

        {/* Cost Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <PieChartIcon size={20} className="text-red-600"/> 비용 구조 (Cost Structure)
              </h2>
           </div>
           <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData.cost}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieChartData.cost.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                     formatter={(value: number, name: string) => [`₩${Math.round(value).toLocaleString()}`, name]}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}}/>
                </PieChart>
              </ResponsiveContainer>
              {/* Top Right Total Text */}
              <div className="absolute top-0 right-0 pointer-events-none">
                  <div className="text-right bg-white/90 p-2 rounded-lg border border-red-100 shadow-sm backdrop-blur-sm">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-lg font-bold text-red-900">
                      ₩{Math.round(totalCost / 10000).toLocaleString()}만
                    </div>
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Bar/Line Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">BEP 시점 및 수익 추이 (10개월)</h2>
        </div>
        
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tickFormatter={(val) => `M+${val}`} stroke="#9CA3AF" />
              <YAxis yAxisId="left" stroke="#9CA3AF" tickFormatter={(val) => `${val / 10000}만`} />
              <Tooltip
                shared={false}
                formatter={(value: number, name: string) => {
                    // Display signed value for Cumulative Profit, but absolute value for costs (which are negative in data)
                    if (name === '누적 손익') {
                      return [`₩${Math.round(value).toLocaleString()}`, name];
                    }
                    return [`₩${Math.abs(Math.round(value)).toLocaleString()}`, name];
                }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                content={() => (
                  <div className="flex justify-center gap-6 mt-4 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{ backgroundColor: CHART_COLORS.revenue.space }}></div>
                      <span>매출</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{ backgroundColor: CHART_COLORS.cost.wine }}></div>
                      <span>비용</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5" style={{ backgroundColor: CHART_COLORS.profit }}></div>
                      <span>누적 손익</span>
                    </div>
                  </div>
                )}
              />
              <ReferenceLine yAxisId="left" y={0} stroke="#000" strokeDasharray="3 3" />
              
              {/* Revenue Stack - Blue Theme (Positive) */}
              <Bar yAxisId="left" dataKey="cafeRevenue" name="카페 매출" stackId="revenue" fill={CHART_COLORS.revenue.cafe} barSize={20} />
              <Bar yAxisId="left" dataKey="spaceRevenue" name="공간대여 매출" stackId="revenue" fill={CHART_COLORS.revenue.space} barSize={20} />
              <Bar yAxisId="left" dataKey="wineRevenue" name="와인바 매출" stackId="revenue" fill={CHART_COLORS.revenue.wine} barSize={20} radius={[4, 4, 0, 0]} />

              {/* Cost Stack - Red Theme (Negative) */}
              <Bar yAxisId="left" dataKey="laborCost" name="인건비" stackId="cost" fill={CHART_COLORS.cost.labor} barSize={20} />
              <Bar yAxisId="left" dataKey="cafeCOGS" name="카페 재료비" stackId="cost" fill={CHART_COLORS.cost.cafe} barSize={20} />
              <Bar yAxisId="left" dataKey="wineCOGS" name="와인 재료비" stackId="cost" fill={CHART_COLORS.cost.wine} barSize={20} />
              <Bar yAxisId="left" dataKey="utilityCost" name="공과금" stackId="cost" fill={CHART_COLORS.cost.utility} barSize={20} />
              <Bar yAxisId="left" dataKey="otherFixedCost" name="기타 고정비" stackId="cost" fill={CHART_COLORS.cost.fixed} barSize={20} radius={[0, 0, 4, 4]} />
              
              {/* Cumulative Profit Line */}
              <Line yAxisId="left" type="monotone" dataKey="cumulativeProfit" name="누적 손익" stroke={CHART_COLORS.profit} strokeWidth={3} dot={{ r: 3, fill: CHART_COLORS.profit }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Detailed Table */}
       <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">월간 재무 상세 (Monthly P&L)</h3>
        <FinancialTable data={monthlyData} />
      </div>
    </div>
  );
};