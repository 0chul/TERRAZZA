import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import {
  Coffee,
  Home,
  Wine,
  Calculator,
  CheckSquare,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';

import { DEFAULT_CONFIG, INITIAL_TODOS, CAFE_UNIT_COSTS } from './constants';
import { GlobalConfig, MonthlyData, TodoItem } from './types';
import { InfoCard } from './components/InfoCard';
import { InputSection } from './components/InputSection';
import { FinancialTable } from './components/FinancialTable';
import { NumberInput, SliderInput } from './components/Inputs';

enum Tab {
  DASHBOARD = 'dashboard',
  PLANNER = 'planner',
  TODO = 'todo',
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [cafeDetailsOpen, setCafeDetailsOpen] = useState(true);
  const [expandedCostRows, setExpandedCostRows] = useState<Set<string>>(new Set());

  // --- Calculations ---

  // 1. Derived Daily Sales Count (Capacity Logic)
  const dailySalesCount = useMemo(() => {
    const { seatCount, operatingHours, stayDuration, turnoverTarget } = config.cafe;
    // Avoid division by zero
    const safeStayDuration = stayDuration > 0 ? stayDuration : 1;
    const maxDailyCapacity = seatCount * (operatingHours / safeStayDuration);
    return Math.round(maxDailyCapacity * turnoverTarget);
  }, [config.cafe]);

  // 2. Helper: Calculate Cafe Unit Costs dynamically with 8-way branching
  const cafeUnitCosts = useMemo(() => {
    const { beanPricePerKg, milkPricePerL, takeoutRatio, iceRatio } = config.cafe;
    
    // Ingredients Cost
    const bean = (beanPricePerKg / 1000) * CAFE_UNIT_COSTS.BEAN_GRAMS;
    const milk = (milkPricePerL / 1000) * CAFE_UNIT_COSTS.MILK_ML;
    const water = CAFE_UNIT_COSTS.WATER;
    const ice = CAFE_UNIT_COSTS.ICE;
    const syrup = CAFE_UNIT_COSTS.SYRUP;

    // Consumables Package Cost
    const packTakeoutHot = 
      CAFE_UNIT_COSTS.HOT_CUP + CAFE_UNIT_COSTS.HOT_LID + CAFE_UNIT_COSTS.STICK + 
      CAFE_UNIT_COSTS.HOLDER + CAFE_UNIT_COSTS.CARRIER + CAFE_UNIT_COSTS.WIPE + CAFE_UNIT_COSTS.NAPKIN;
    
    const packTakeoutIce = 
      CAFE_UNIT_COSTS.ICE_CUP + CAFE_UNIT_COSTS.ICE_LID + CAFE_UNIT_COSTS.STRAW + 
      CAFE_UNIT_COSTS.HOLDER + CAFE_UNIT_COSTS.CARRIER + CAFE_UNIT_COSTS.WIPE + CAFE_UNIT_COSTS.NAPKIN;

    const packStoreHot = 
      CAFE_UNIT_COSTS.STICK + CAFE_UNIT_COSTS.WIPE + CAFE_UNIT_COSTS.NAPKIN + CAFE_UNIT_COSTS.DISHWASHING;
      
    const packStoreIce = 
      CAFE_UNIT_COSTS.STRAW + CAFE_UNIT_COSTS.WIPE + CAFE_UNIT_COSTS.NAPKIN + CAFE_UNIT_COSTS.DISHWASHING;

    // Assemble Product Costs
    const products = {
        takeout: {
            hot: {
                americano: packTakeoutHot + bean + water,
                latte: packTakeoutHot + bean + milk,
                syrupLatte: packTakeoutHot + bean + milk + syrup
            },
            ice: {
                americano: packTakeoutIce + bean + water + ice,
                latte: packTakeoutIce + bean + milk + ice,
                syrupLatte: packTakeoutIce + bean + milk + ice + syrup
            }
        },
        store: {
            hot: {
                americano: packStoreHot + bean + water,
                latte: packStoreHot + bean + milk,
                syrupLatte: packStoreHot + bean + milk + syrup
            },
            ice: {
                americano: packStoreIce + bean + water + ice,
                latte: packStoreIce + bean + milk + ice,
                syrupLatte: packStoreIce + bean + milk + ice + syrup
            }
        }
    };

    // Calculate Weighted Averages
    const avgTakeoutAm = products.takeout.ice.americano * iceRatio + products.takeout.hot.americano * (1 - iceRatio);
    const avgTakeoutLatte = products.takeout.ice.latte * iceRatio + products.takeout.hot.latte * (1 - iceRatio);
    const avgTakeoutSyrup = products.takeout.ice.syrupLatte * iceRatio + products.takeout.hot.syrupLatte * (1 - iceRatio);

    const avgStoreAm = products.store.ice.americano * iceRatio + products.store.hot.americano * (1 - iceRatio);
    const avgStoreLatte = products.store.ice.latte * iceRatio + products.store.hot.latte * (1 - iceRatio);
    const avgStoreSyrup = products.store.ice.syrupLatte * iceRatio + products.store.hot.syrupLatte * (1 - iceRatio);

    const finalCostAmericano = (avgTakeoutAm * takeoutRatio) + (avgStoreAm * (1 - takeoutRatio));
    const finalCostLatte = (avgTakeoutLatte * takeoutRatio) + (avgStoreLatte * (1 - takeoutRatio));
    const finalCostSyrupLatte = (avgTakeoutSyrup * takeoutRatio) + (avgStoreSyrup * (1 - takeoutRatio));

    return {
      unitCosts: { bean, milk, water, ice, syrup },
      finalCostAmericano,
      finalCostLatte,
      finalCostSyrupLatte,
      products
    };
  }, [config.cafe]);

  // 3. Monthly Financial Data
  const monthlyData: MonthlyData[] = useMemo(() => {
    const data: MonthlyData[] = [];
    const totalInitialCost =
      config.initial.deposit +
      config.initial.interior +
      config.initial.equipment +
      config.initial.design +
      config.initial.supplies;

    let cumulativeProfit = -totalInitialCost;

    for (let m = 1; m <= projectionMonths; m++) {
      // Cafe Calculations
      const weightedAvgPrice = 
        config.cafe.avgPriceAmericano * config.cafe.ratioAmericano +
        config.cafe.avgPriceLatte * config.cafe.ratioLatte +
        config.cafe.avgPriceSyrupLatte * config.cafe.ratioSyrupLatte;

      const cafeRevenue = weightedAvgPrice * dailySalesCount * config.cafe.operatingDays;

      const weightedAvgCost = 
        cafeUnitCosts.finalCostAmericano * config.cafe.ratioAmericano +
        cafeUnitCosts.finalCostLatte * config.cafe.ratioLatte +
        cafeUnitCosts.finalCostSyrupLatte * config.cafe.ratioSyrupLatte;

      const cafeCOGS = weightedAvgCost * dailySalesCount * config.cafe.operatingDays;

      // Space Rental Calculations
      const spaceRevenue =
        config.space.hourlyRate *
        config.space.hoursPerDay *
        config.space.utilizationRate *
        config.space.operatingDays;
      const spaceCOGS = 0;

      // Wine Bar Calculations
      const wineRevenue =
        config.wine.avgTicketPrice *
        config.wine.dailyTables *
        config.wine.operatingDays;
      const wineCOGS = wineRevenue * config.wine.costOfGoodsSoldRate;

      // Aggregations
      const totalRevenue = cafeRevenue + spaceRevenue + wineRevenue;
      const totalCOGS = cafeCOGS + spaceCOGS + wineCOGS;
      const grossProfit = totalRevenue - totalCOGS;

      const totalFixedCosts =
        config.fixed.rent +
        config.fixed.labor +
        config.fixed.utilities +
        config.fixed.internet +
        config.fixed.marketing +
        config.fixed.maintenance +
        config.fixed.misc;

      const netProfit = grossProfit - totalFixedCosts;

      cumulativeProfit += netProfit;

      data.push({
        month: m,
        revenue: totalRevenue,
        cogs: totalCOGS,
        grossProfit,
        fixedCosts: totalFixedCosts,
        netProfit,
        cumulativeProfit,
      });
    }
    return data;
  }, [config, projectionMonths, cafeUnitCosts, dailySalesCount]);

  const bepMonth = useMemo(() => {
    const match = monthlyData.find(d => d.cumulativeProfit >= 0);
    return match ? `M+${match.month}` : '미도달';
  }, [monthlyData]);

  const totalInvestment = useMemo(() => {
    return Object.values(config.initial).reduce((a, b) => a + b, 0);
  }, [config.initial]);

  // --- Handlers ---
  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleConfigChange = (section: keyof GlobalConfig, field: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleCostRow = (key: string) => {
    const newSet = new Set(expandedCostRows);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExpandedCostRows(newSet);
  }

  // --- Render Components ---

  // ... CostDetailItem and CostDetailCard components remain the same ...
  const CostDetailItem = ({ label, value }: { label: string, value: number }) => (
    <div className="flex justify-between text-xs text-gray-600 mb-1">
      <span>{label}</span>
      <span>{Math.round(value)}원</span>
    </div>
  );

  const CostDetailCard = ({ title, items, total }: { title: string, items: {label: string, value: number}[], total: number }) => (
    <div className="bg-white p-3 rounded border border-gray-200 shadow-sm h-full">
      <div className="text-xs font-bold text-gray-800 mb-2 border-b pb-1">{title}</div>
      <div className="space-y-1 mb-2">
        {items.map((item, idx) => (
          <CostDetailItem key={idx} label={item.label} value={item.value} />
        ))}
      </div>
      <div className="border-t pt-1 flex justify-between font-bold text-xs text-blue-700">
        <span>합계</span>
        <span>{Math.round(total).toLocaleString()}원</span>
      </div>
    </div>
  );

  const renderCostDetails = (menu: 'americano' | 'latte' | 'syrupLatte') => {
      // ... logic for details (same as previous) ...
      const uc = cafeUnitCosts.unitCosts;
      const commonTakeoutHot = [
          { label: 'Hot 컵', value: CAFE_UNIT_COSTS.HOT_CUP },
          { label: '뚜껑', value: CAFE_UNIT_COSTS.HOT_LID },
          { label: '홀더', value: CAFE_UNIT_COSTS.HOLDER },
          { label: '캐리어', value: CAFE_UNIT_COSTS.CARRIER },
          { label: '스틱/냅킨', value: CAFE_UNIT_COSTS.STICK + CAFE_UNIT_COSTS.NAPKIN + CAFE_UNIT_COSTS.WIPE },
      ];
      const commonTakeoutIce = [
          { label: 'Ice 컵', value: CAFE_UNIT_COSTS.ICE_CUP },
          { label: '뚜껑', value: CAFE_UNIT_COSTS.ICE_LID },
          { label: '홀더', value: CAFE_UNIT_COSTS.HOLDER },
          { label: '캐리어', value: CAFE_UNIT_COSTS.CARRIER },
          { label: '빨대/냅킨', value: CAFE_UNIT_COSTS.STRAW + CAFE_UNIT_COSTS.NAPKIN + CAFE_UNIT_COSTS.WIPE },
      ];
      const commonStore = [
          { label: '세척/관리', value: CAFE_UNIT_COSTS.DISHWASHING },
          { label: '물티슈/냅킨', value: CAFE_UNIT_COSTS.WIPE + CAFE_UNIT_COSTS.NAPKIN },
      ];

      let ingredientsBase: {label: string, value: number}[] = [];
      if (menu === 'americano') ingredientsBase = [{ label: '원두', value: uc.bean }, { label: '정수물', value: uc.water }];
      if (menu === 'latte') ingredientsBase = [{ label: '원두', value: uc.bean }, { label: '우유', value: uc.milk }];
      if (menu === 'syrupLatte') ingredientsBase = [{ label: '원두', value: uc.bean }, { label: '우유', value: uc.milk }, { label: '시럽', value: uc.syrup }];

      const getItems = (type: 'takeoutHot' | 'takeoutIce' | 'storeHot' | 'storeIce') => {
          let items = [...ingredientsBase];
          if (type === 'takeoutHot') items = [...items, ...commonTakeoutHot];
          if (type === 'takeoutIce') items = [...items, { label: '얼음', value: uc.ice }, ...commonTakeoutIce];
          if (type === 'storeHot') items = [...items, {label: '스틱', value: CAFE_UNIT_COSTS.STICK}, ...commonStore];
          if (type === 'storeIce') items = [...items, { label: '얼음', value: uc.ice }, {label: '빨대', value: CAFE_UNIT_COSTS.STRAW}, ...commonStore];
          return items;
      };

      return (
          <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 border-t border-gray-200">
               <CostDetailCard title="Takeout (Hot)" items={getItems('takeoutHot')} total={cafeUnitCosts.products.takeout.hot[menu]} />
               <CostDetailCard title="Takeout (Ice)" items={getItems('takeoutIce')} total={cafeUnitCosts.products.takeout.ice[menu]} />
               <CostDetailCard title="매장 (Hot)" items={getItems('storeHot')} total={cafeUnitCosts.products.store.hot[menu]} />
               <CostDetailCard title="매장 (Ice)" items={getItems('storeIce')} total={cafeUnitCosts.products.store.ice[menu]} />
          </div>
      );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          title="월 예상 매출"
          value={`₩${Math.round(monthlyData[0]?.revenue / 10000).toLocaleString()}만`}
          subValue="3가지 사업 합산"
          icon={<TrendingUp className="text-blue-500" />}
        />
        <InfoCard
          title="월 예상 순이익"
          value={`₩${Math.round(monthlyData[0]?.netProfit / 10000).toLocaleString()}만`}
          subValue={`마진율 ${Math.round((monthlyData[0]?.netProfit / monthlyData[0]?.revenue) * 100)}%`}
          icon={<DollarSign className="text-green-500" />}
        />
        <InfoCard
          title="초기 투자비용"
          value={`₩${Math.round(totalInvestment / 10000).toLocaleString()}만`}
          subValue="보증금 포함"
          icon={<Calculator className="text-purple-500" />}
        />
        <InfoCard
          title="손익분기점 (BEP)"
          value={bepMonth}
          subValue={bepMonth !== '미도달' ? '누적 수익 전환 시점' : '1년 내 달성 불가'}
          icon={<AlertCircle className="text-orange-500" />}
        />
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-6">BEP 시점 및 수익 구조 분석</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tickFormatter={(val) => `M+${val}`} stroke="#9CA3AF" />
              <YAxis yAxisId="left" orientation="left" stroke="#9CA3AF" tickFormatter={(val) => `${val / 10000}만`} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" tickFormatter={(val) => `${val / 10000}만`} />
              <Tooltip
                formatter={(value: number) => `₩${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <ReferenceLine y={0} yAxisId="right" stroke="#000" strokeDasharray="3 3" />
              <Bar yAxisId="left" dataKey="netProfit" name="월 순이익" fill="#3B82F6" barSize={30} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="cumulativeProfit" name="누적 손익" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} />
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

  const renderCafeDetailPlanner = () => {
    const totalRatio = config.cafe.ratioAmericano + config.cafe.ratioLatte + config.cafe.ratioSyrupLatte;
    const isRatioValid = Math.abs(totalRatio - 1.0) < 0.01;
    const maxCapacity = Math.round(config.cafe.seatCount * (config.cafe.operatingHours / (config.cafe.stayDuration || 1)));

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <button
          onClick={() => setCafeDetailsOpen(!cafeDetailsOpen)}
          className="w-full px-6 py-4 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors border-l-4 border-amber-500"
        >
          <div className="flex items-center gap-3">
             <Coffee className="text-amber-700" size={24}/>
             <div className="text-left">
                <span className="block font-bold text-lg text-gray-800">카페 (Cafe) 상세 설정</span>
                <span className="text-xs text-gray-500">테이크아웃/매장/HOT/ICE 및 좌석 회전율 기반 매출 예측</span>
             </div>
          </div>
          {cafeDetailsOpen ? <ChevronDown size={24} className="text-amber-700" /> : <ChevronRight size={24} className="text-gray-400" />}
        </button>
        
        {cafeDetailsOpen && (
          <div className="p-6 border-t border-gray-200 space-y-8">
            {/* 1. Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Column 1: Capacity & Turnover (New) */}
               <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                    <Users size={16}/> 매출/회전율 예측
                  </h4>
                  
                  <div className="bg-white p-3 rounded border border-indigo-100 shadow-sm mb-4">
                     <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>일 최대 회전 좌석</span>
                        <span className="font-bold">{maxCapacity}석</span>
                     </div>
                     <div className="flex justify-between text-lg text-indigo-700 font-bold items-center border-t border-indigo-50 pt-1 mt-1">
                        <span>일일 판매량</span>
                        <span>{dailySalesCount} 잔/팀</span>
                     </div>
                  </div>

                  <NumberInput label="총 좌석 수" value={config.cafe.seatCount} onChange={(v) => handleConfigChange('cafe', 'seatCount', v)} unit="석" />
                  <NumberInput label="일 영업 시간" value={config.cafe.operatingHours} onChange={(v) => handleConfigChange('cafe', 'operatingHours', v)} unit="시간" />
                  <NumberInput label="고객 평균 점유시간" value={config.cafe.stayDuration} onChange={(v) => handleConfigChange('cafe', 'stayDuration', v)} unit="시간" step={0.5} />
                  
                  <div className="mt-4 pt-4 border-t border-indigo-200">
                     <SliderInput 
                        label="좌석 회전율 (목표)" 
                        value={config.cafe.turnoverTarget} 
                        onChange={(v) => handleConfigChange('cafe', 'turnoverTarget', v)} 
                        step={0.05} 
                        max={2.0} // Allow up to 200% turnover
                     />
                  </div>
               </div>

               {/* Column 2: Ratios */}
               <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <TrendingUp size={16}/> 판매 비중 설정
                  </h4>
                  <div className={`p-2 rounded border mb-4 ${isRatioValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                     <div className="text-xs text-gray-500 mb-1">메뉴 비중 합계 (1.0 맞춰주세요)</div>
                     <div className={`text-lg font-bold ${isRatioValid ? 'text-green-700' : 'text-red-600'}`}>
                        {(totalRatio).toFixed(2)} / 1.00
                     </div>
                  </div>
                  
                  <SliderInput label="아메리카노 비중" value={config.cafe.ratioAmericano} onChange={(v) => handleConfigChange('cafe', 'ratioAmericano', v)} step={0.05} />
                  <SliderInput label="카페라떼 비중" value={config.cafe.ratioLatte} onChange={(v) => handleConfigChange('cafe', 'ratioLatte', v)} step={0.05} />
                  <SliderInput label="시럽라떼 비중" value={config.cafe.ratioSyrupLatte} onChange={(v) => handleConfigChange('cafe', 'ratioSyrupLatte', v)} step={0.05} />
                  
                  <div className="my-4 border-t border-gray-200"></div>
                  
                  <SliderInput label="테이크아웃 비율" value={config.cafe.takeoutRatio} onChange={(v) => handleConfigChange('cafe', 'takeoutRatio', v)} step={0.05} />
                  <SliderInput label="아이스 음료 비율" value={config.cafe.iceRatio} onChange={(v) => handleConfigChange('cafe', 'iceRatio', v)} step={0.05} />
               </div>

               {/* Column 3: Costs & Prices */}
               <div className="space-y-6">
                  {/* Prices */}
                   <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <DollarSign size={16}/> 판매가 설정
                      </h4>
                      <NumberInput label="아메리카노" value={config.cafe.avgPriceAmericano} onChange={(v) => handleConfigChange('cafe', 'avgPriceAmericano', v)} unit="원" />
                      <NumberInput label="카페라떼" value={config.cafe.avgPriceLatte} onChange={(v) => handleConfigChange('cafe', 'avgPriceLatte', v)} unit="원" />
                      <NumberInput label="시럽라떼" value={config.cafe.avgPriceSyrupLatte} onChange={(v) => handleConfigChange('cafe', 'avgPriceSyrupLatte', v)} unit="원" />
                   </div>

                   {/* Materials */}
                   <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calculator size={16}/> 재료비 설정
                      </h4>
                      <NumberInput label="원두 가격 (1kg)" value={config.cafe.beanPricePerKg} onChange={(v) => handleConfigChange('cafe', 'beanPricePerKg', v)} unit="원" />
                      <NumberInput label="우유 가격 (1L)" value={config.cafe.milkPricePerL} onChange={(v) => handleConfigChange('cafe', 'milkPricePerL', v)} unit="원" />
                      <div className="pt-2 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                            <span>원두 1잔({CAFE_UNIT_COSTS.BEAN_GRAMS}g)</span>
                            <span className="font-bold">{Math.round(cafeUnitCosts.unitCosts.bean)}원</span>
                        </div>
                        <div className="flex justify-between">
                            <span>우유 1잔({CAFE_UNIT_COSTS.MILK_ML}ml)</span>
                            <span className="font-bold">{Math.round(cafeUnitCosts.unitCosts.milk)}원</span>
                        </div>
                         <div className="flex justify-between">
                            <span>시럽 1회(30ml)</span>
                            <span className="font-bold text-amber-600">+{Math.round(cafeUnitCosts.unitCosts.syrup)}원</span>
                        </div>
                      </div>
                   </div>
               </div>
            </div>

            {/* 2. Detailed Cost Breakdown Matrix */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide flex justify-between items-end">
                  <span>상황별 1잔 원가 분석표 (Cost Matrix)</span>
                  <span className="text-xs normal-case text-gray-500 font-normal">비중: Takeout {config.cafe.takeoutRatio*100}% | Ice {config.cafe.iceRatio*100}%</span>
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left w-32 font-bold">구분</th>
                            <th className="px-4 py-3 bg-blue-50 text-blue-900">Takeout (Hot)</th>
                            <th className="px-4 py-3 bg-blue-100 text-blue-900">Takeout (Ice)</th>
                            <th className="px-4 py-3 bg-green-50 text-green-900">매장 (Hot)</th>
                            <th className="px-4 py-3 bg-green-100 text-green-900">매장 (Ice)</th>
                            <th className="px-4 py-3 bg-gray-800 text-white font-bold">최종 가중평균</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Americano Row */}
                        <tr onClick={() => toggleCostRow('americano')} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                            <td className="px-4 py-3 text-left font-semibold text-gray-800 flex items-center gap-2">
                                {expandedCostRows.has('americano') ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600"/>}
                                아메리카노
                            </td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.hot.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.ice.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.hot.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.ice.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 font-bold bg-amber-50 text-amber-900 border-l border-amber-100">
                                {Math.round(cafeUnitCosts.finalCostAmericano).toLocaleString()}원
                            </td>
                        </tr>
                        {expandedCostRows.has('americano') && (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <div className="pl-32">
                                         {renderCostDetails('americano')}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Latte Row */}
                        <tr onClick={() => toggleCostRow('latte')} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                            <td className="px-4 py-3 text-left font-semibold text-gray-800 flex items-center gap-2">
                                {expandedCostRows.has('latte') ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600"/>}
                                카페라떼
                            </td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.hot.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.ice.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.hot.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.ice.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 font-bold bg-amber-50 text-amber-900 border-l border-amber-100">
                                {Math.round(cafeUnitCosts.finalCostLatte).toLocaleString()}원
                            </td>
                        </tr>
                        {expandedCostRows.has('latte') && (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <div className="pl-32">
                                         {renderCostDetails('latte')}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Syrup Latte Row */}
                        <tr onClick={() => toggleCostRow('syrupLatte')} className="hover:bg-gray-50 cursor-pointer transition-colors group bg-amber-50/30">
                            <td className="px-4 py-3 text-left font-semibold text-gray-800 flex items-center gap-2">
                                {expandedCostRows.has('syrupLatte') ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600"/>}
                                시럽 라떼
                            </td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.hot.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.ice.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.hot.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.ice.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 font-bold bg-amber-50 text-amber-900 border-l border-amber-100">
                                {Math.round(cafeUnitCosts.finalCostSyrupLatte).toLocaleString()}원
                            </td>
                        </tr>
                         {expandedCostRows.has('syrupLatte') && (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <div className="pl-32">
                                         {renderCostDetails('syrupLatte')}
                                    </div>
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                * 메뉴명을 클릭하면 상세 재료비 및 포장재 원가를 확인할 수 있습니다.<br/>
                * Takeout: 컵/뚜껑/홀더/캐리어/물티슈 포함 (Ice는 빨대 포함, Hot은 스틱 포함)<br/>
                * 매장: 설거지비용(수도/인건)/물티슈 포함 (일회용컵 제외)
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderPlanner = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-6 flex items-start gap-2">
        <Calculator className="mt-0.5 flex-shrink-0" size={16}/>
        <p>각 사업별 상세 설정을 입력하세요. 카페는 테이크아웃, 아이스 비율 등 상세 조건에 따라 원가가 정밀하게 계산됩니다.</p>
      </div>

      {/* Render the specialized Cafe Submenu */}
      {renderCafeDetailPlanner()}

      <InputSection title="🏠 공간대여 (Space Rental) 설정">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberInput label="시간당 대여료" value={config.space.hourlyRate} onChange={(v) => handleConfigChange('space', 'hourlyRate', v)} unit="원" />
          <NumberInput label="일 가용 시간" value={config.space.hoursPerDay} onChange={(v) => handleConfigChange('space', 'hoursPerDay', v)} unit="시간" />
          <NumberInput label="월 영업일수" value={config.space.operatingDays} onChange={(v) => handleConfigChange('space', 'operatingDays', v)} unit="일" />
          <NumberInput label="가동률 (예약률)" value={config.space.utilizationRate} onChange={(v) => handleConfigChange('space', 'utilizationRate', v)} step={0.1} />
        </div>
      </InputSection>

      <InputSection title="🍷 와인바 (Wine Bar) 설정">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberInput label="테이블당 평균 단가" value={config.wine.avgTicketPrice} onChange={(v) => handleConfigChange('wine', 'avgTicketPrice', v)} unit="원" />
          <NumberInput label="일 평균 테이블 수" value={config.wine.dailyTables} onChange={(v) => handleConfigChange('wine', 'dailyTables', v)} unit="팀" />
          <NumberInput label="원가율 (안주+주류)" value={config.wine.costOfGoodsSoldRate} onChange={(v) => handleConfigChange('wine', 'costOfGoodsSoldRate', v)} step={0.01} />
          <NumberInput label="월 영업일수" value={config.wine.operatingDays} onChange={(v) => handleConfigChange('wine', 'operatingDays', v)} unit="일" />
        </div>
      </InputSection>

      <InputSection title="🏢 고정비 및 초기투자 (Fixed & Initial Cost)">
        <div className="space-y-6">
            <h4 className="font-medium text-gray-700 border-b pb-2">월 고정 비용</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NumberInput label="월 임대료" value={config.fixed.rent} onChange={(v) => handleConfigChange('fixed', 'rent', v)} unit="원" />
                <NumberInput label="인건비 (총액)" value={config.fixed.labor} onChange={(v) => handleConfigChange('fixed', 'labor', v)} unit="원" />
                <NumberInput label="공과금 (수도/전기)" value={config.fixed.utilities} onChange={(v) => handleConfigChange('fixed', 'utilities', v)} unit="원" />
                <NumberInput label="마케팅비" value={config.fixed.marketing} onChange={(v) => handleConfigChange('fixed', 'marketing', v)} unit="원" />
            </div>

            <h4 className="font-medium text-gray-700 border-b pb-2 pt-4">초기 투자 비용</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NumberInput label="보증금" value={config.initial.deposit} onChange={(v) => handleConfigChange('initial', 'deposit', v)} unit="원" />
                <NumberInput label="인테리어" value={config.initial.interior} onChange={(v) => handleConfigChange('initial', 'interior', v)} unit="원" />
                <NumberInput label="설비/집기" value={config.initial.equipment} onChange={(v) => handleConfigChange('initial', 'equipment', v)} unit="원" />
                <NumberInput label="디자인/브랜딩" value={config.initial.design} onChange={(v) => handleConfigChange('initial', 'design', v)} unit="원" />
            </div>
        </div>
      </InputSection>
    </div>
  );

  const renderTodo = () => {
    // Group by category
    const groupedTodos = todos.reduce((acc, todo) => {
      if (!acc[todo.category]) acc[todo.category] = [];
      acc[todo.category].push(todo);
      return acc;
    }, {} as Record<string, TodoItem[]>);

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-800">개업 준비 체크리스트</h2>
            <div className="text-gray-500 text-sm">
                진행률: {Math.round((todos.filter(t => t.completed).length / todos.length) * 100)}%
            </div>
        </div>

        {Object.entries(groupedTodos).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 font-semibold text-gray-700 border-b border-gray-200">
              {category}
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center p-4 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => toggleTodo(item.id)}>
                  <div className={`w-6 h-6 rounded border flex items-center justify-center mr-4 transition-all ${item.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                    {item.completed && <CheckSquare className="text-white w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {item.task}
                    </div>
                    {item.note && <div className="text-xs text-gray-500 mt-0.5">{item.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Coffee className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">BizPlanner <span className="text-blue-600 font-light">3-in-1</span></span>
            </div>
            
            {/* Nav Tabs */}
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: Tab.DASHBOARD, label: '대시보드', icon: <TrendingUp size={16} /> },
                { id: Tab.PLANNER, label: '계획 설정', icon: <Calculator size={16} /> },
                { id: Tab.TODO, label: '체크리스트', icon: <CheckSquare size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === Tab.DASHBOARD && renderDashboard()}
        {activeTab === Tab.PLANNER && renderPlanner()}
        {activeTab === Tab.TODO && renderTodo()}
      </main>
    </div>
  );
}