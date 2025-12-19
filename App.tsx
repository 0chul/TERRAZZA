
import React, { useState, useMemo, useEffect } from 'react';
import {
  Coffee,
  Calculator,
  CheckSquare,
  TrendingUp,
  Sparkles,
  Trash2,
  Plus,
  BarChart2,
  Save,
  Copy,
  Layout
} from 'lucide-react';

import { DEFAULT_CONFIG, INITIAL_TODOS, PLAN_PRESETS } from './constants';
import { GlobalConfig, MonthlyData, TodoItem, CafeUnitCosts, Scenario } from './types';
import { DashboardTab } from './components/DashboardTab';
import { PlannerTab } from './components/PlannerTab';
import { TodoTab } from './components/TodoTab';
import { ComparisonTab } from './components/ComparisonTab';

enum Tab {
  DASHBOARD = 'dashboard',
  PLANNER = 'planner',
  COMPARISON = 'comparison',
  TODO = 'todo',
}

const WEEKDAY_MONTHLY_RATE = 2156880; 
const WEEKEND_MONTHLY_RATE = 861200;  

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [projectionMonths, setProjectionMonths] = useState(12);

  useEffect(() => {
    const saved = localStorage.getItem('terrazza_scenarios');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScenarios(parsed);
      } catch (e) {
        console.error("Failed to parse saved scenarios");
      }
    }
  }, []);

  const saveCurrentScenario = (name: string) => {
    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      name,
      config: JSON.parse(JSON.stringify(config)),
      timestamp: Date.now()
    };
    const updated = [...scenarios, newScenario];
    setScenarios(updated);
    localStorage.setItem('terrazza_scenarios', JSON.stringify(updated));
    setActiveScenarioId(newScenario.id);
  };

  const applyPreset = (presetName: string) => {
    const preset = PLAN_PRESETS[presetName];
    if (preset) {
      setConfig(prev => ({ ...prev, ...preset }));
      setActiveScenarioId(null);
    }
  };

  const loadScenario = (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      setConfig(JSON.parse(JSON.stringify(scenario.config)));
      setActiveScenarioId(id);
    }
  };

  const deleteScenario = (id: string) => {
    const updated = scenarios.filter(s => s.id !== id);
    setScenarios(updated);
    localStorage.setItem('terrazza_scenarios', JSON.stringify(updated));
    if (activeScenarioId === id) setActiveScenarioId(null);
  };

  const cafeUnitCosts: CafeUnitCosts = useMemo(() => {
    const { beanPricePerKg, milkPricePerL, iceRatio, takeoutRatio } = config.cafe;
    const s = config.cafeSupplies;
    
    const bean = (beanPricePerKg / 1000) * s.beanGrams;
    const milk = (milkPricePerL / 1000) * s.milkMl;
    const water = s.water;
    const ice = s.ice;
    const syrup = s.syrup;

    const getMenuCost = (menu: 'am' | 'lt' | 'sl', type: 'to' | 'st', temp: 'h' | 'i') => {
      let ing = bean;
      if (menu === 'am') ing += water;
      else if (menu === 'lt') ing += milk;
      else ing += milk + syrup;
      
      if (temp === 'i') ing += ice;

      let pkg = 0;
      if (type === 'to') {
        pkg = temp === 'h' 
          ? (s.hotCup + s.hotLid + s.stick + s.holder + s.carrier + s.wipe + s.napkin) 
          : (s.iceCup + s.iceLid + s.straw + s.holder + s.carrier + s.wipe + s.napkin);
      } else {
        pkg = s.wipe + s.napkin + s.dishwashing + (temp === 'h' ? s.stick : s.straw);
      }
      return ing + pkg;
    };

    const products = {
      takeout: {
        hot: {
          americano: getMenuCost('am', 'to', 'h'),
          latte: getMenuCost('lt', 'to', 'h'),
          syrupLatte: getMenuCost('sl', 'to', 'h'),
        },
        ice: {
          americano: getMenuCost('am', 'to', 'i'),
          latte: getMenuCost('lt', 'to', 'i'),
          syrupLatte: getMenuCost('sl', 'to', 'i'),
        }
      },
      store: {
        hot: {
          americano: getMenuCost('am', 'st', 'h'),
          latte: getMenuCost('lt', 'st', 'h'),
          syrupLatte: getMenuCost('sl', 'st', 'h'),
        },
        ice: {
          americano: getMenuCost('am', 'st', 'i'),
          latte: getMenuCost('lt', 'st', 'i'),
          syrupLatte: getMenuCost('sl', 'st', 'i'),
        }
      }
    };

    const calcWeighted = (m: 'americano' | 'latte' | 'syrupLatte') => {
      const toH = products.takeout.hot[m];
      const toI = products.takeout.ice[m];
      const stH = products.store.hot[m];
      const stI = products.store.ice[m];

      const toWeighted = toI * iceRatio + toH * (1 - iceRatio);
      const stWeighted = stI * iceRatio + stH * (1 - iceRatio);
      return toWeighted * takeoutRatio + stWeighted * (1 - takeoutRatio);
    };

    return {
      unitCosts: { bean, milk, water, ice, syrup },
      finalCostAmericano: calcWeighted('americano'),
      finalCostLatte: calcWeighted('latte'),
      finalCostSyrupLatte: calcWeighted('syrupLatte'),
      products
    };
  }, [config.cafe, config.cafeSupplies]);

  const calculateFinancials = (cfg: GlobalConfig, uc: CafeUnitCosts) => {
    const { seatCount, operatingHours, stayDuration, turnoverTarget, ratioAmericano, ratioLatte, ratioSyrupLatte, avgPriceAmericano, avgPriceLatte, avgPriceSyrupLatte, operatingDays: cafeDays } = cfg.cafe;
    const { hourlyRate, hoursPerDay, operatingDays: spaceDays, utilizationRate } = cfg.space;
    const { avgTicketPrice, dailyTables, operatingDays: wineDays, costOfGoodsSoldRate } = cfg.wine;
    const { weekdayStaff, weekendStaff, additionalLabor, utilities, internet, marketing, maintenance, misc } = cfg.fixed;

    const safeStayDuration = stayDuration > 0 ? stayDuration : 1;
    const maxDailyCapacity = seatCount * (operatingHours / safeStayDuration);
    const salesCount = Math.round(maxDailyCapacity * turnoverTarget);

    const laborCost = (weekdayStaff * WEEKDAY_MONTHLY_RATE) + (weekendStaff * WEEKEND_MONTHLY_RATE) + additionalLabor;
    
    const weightedAvgPrice = avgPriceAmericano * ratioAmericano + avgPriceLatte * ratioLatte + avgPriceSyrupLatte * ratioSyrupLatte;
    const weightedAvgCost = uc.finalCostAmericano * ratioAmericano + uc.finalCostLatte * ratioLatte + uc.finalCostSyrupLatte * ratioSyrupLatte;

    const cafeRevenue = weightedAvgPrice * salesCount * cafeDays;
    const cafeCOGS = weightedAvgCost * salesCount * cafeDays;
    const spaceRevenue = hourlyRate * hoursPerDay * utilizationRate * spaceDays;
    const wineRevenue = avgTicketPrice * dailyTables * wineDays;
    const wineCOGS = wineRevenue * costOfGoodsSoldRate;
    
    const totalRevenue = cafeRevenue + spaceRevenue + wineRevenue;
    const totalCOGS = cafeCOGS + wineCOGS;
    const totalFixed = laborCost + utilities + internet + marketing + maintenance + misc;
    const netProfit = (totalRevenue - totalCOGS) - totalFixed;
    const totalInvestment = Object.values(cfg.initial).reduce((a, b) => a + b, 0);

    return { totalRevenue, netProfit, totalInvestment, salesCount, cafeRevenue, spaceRevenue, wineRevenue, laborCost, totalFixed, cafeCOGS, wineCOGS, totalCOGS };
  };

  const currentFinancials = useMemo(() => calculateFinancials(config, cafeUnitCosts), [config, cafeUnitCosts]);

  const monthlyData: MonthlyData[] = useMemo(() => {
    const data: MonthlyData[] = [];
    let cumulativeProfit = -currentFinancials.totalInvestment;

    for (let m = 1; m <= projectionMonths; m++) {
      cumulativeProfit += currentFinancials.netProfit;
      data.push({
        month: m,
        cafeRevenue: currentFinancials.cafeRevenue,
        spaceRevenue: currentFinancials.spaceRevenue,
        wineRevenue: currentFinancials.wineRevenue,
        revenue: currentFinancials.totalRevenue,
        cafeCOGS: currentFinancials.cafeCOGS,
        wineCOGS: currentFinancials.wineCOGS,
        laborCost: currentFinancials.laborCost,
        utilityCost: config.fixed.utilities,
        otherFixedCost: config.fixed.marketing + config.fixed.internet + config.fixed.maintenance + config.fixed.misc,
        cogs: currentFinancials.totalCOGS,
        grossProfit: currentFinancials.totalRevenue - currentFinancials.totalCOGS,
        fixedCosts: currentFinancials.totalFixed,
        netProfit: currentFinancials.netProfit,
        cumulativeProfit,
      });
    }
    return data;
  }, [currentFinancials, projectionMonths, config]);

  const bepMonth = useMemo(() => {
    const match = monthlyData.find(d => d.cumulativeProfit >= 0);
    return match ? `M+${match.month}` : '측정 불가';
  }, [monthlyData]);

  const calculateFinancialsForScenario = (cfg: GlobalConfig) => {
    const tempUc = (() => {
      const { beanPricePerKg, milkPricePerL, iceRatio, takeoutRatio } = cfg.cafe;
      const s = cfg.cafeSupplies;
      const bean = (beanPricePerKg / 1000) * s.beanGrams;
      const milk = (milkPricePerL / 1000) * s.milkMl;
      const water = s.water;
      const ice = s.ice;
      const syrup = s.syrup;

      const getMenuCost = (menu: 'am' | 'lt' | 'sl', type: 'to' | 'st', temp: 'h' | 'i') => {
        let ing = bean;
        if (menu === 'am') ing += water; else if (menu === 'lt') ing += milk; else ing += milk + syrup;
        if (temp === 'i') ing += ice;
        let pkg = 0;
        if (type === 'to') {
          pkg = temp === 'h' ? (s.hotCup + s.hotLid + s.stick + s.holder + s.carrier + s.wipe + s.napkin) : (s.iceCup + s.iceLid + s.straw + s.holder + s.carrier + s.wipe + s.napkin);
        } else {
          pkg = s.wipe + s.napkin + s.dishwashing + (temp === 'h' ? s.stick : s.straw);
        }
        return ing + pkg;
      };

      const calcWeighted = (m: 'am' | 'lt' | 'sl') => {
        const toH = getMenuCost(m, 'to', 'h');
        const toI = getMenuCost(m, 'to', 'i');
        const stH = getMenuCost(m, 'st', 'h');
        const stI = getMenuCost(m, 'st', 'i');
        const toWeighted = toI * iceRatio + toH * (1 - iceRatio);
        const stWeighted = stI * iceRatio + stH * (1 - iceRatio);
        return toWeighted * takeoutRatio + stWeighted * (1 - takeoutRatio);
      };

      return {
        finalCostAmericano: calcWeighted('am'),
        finalCostLatte: calcWeighted('lt'),
        finalCostSyrupLatte: calcWeighted('sl'),
      };
    })();

    const fin = calculateFinancials(cfg, tempUc as any);
    return {
      totalRevenue: fin.totalRevenue,
      netProfit: fin.netProfit,
      totalInvestment: fin.totalInvestment
    };
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] font-sans text-[#3e2723] pb-20">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-[#5d4037] p-2 rounded-xl shadow-orange-100 shadow-lg">
                <Layout className="text-white h-6 w-6" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight block leading-none text-[#5d4037]">Terrazza</span>
                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Business Planner</span>
              </div>
            </div>
            
            <nav className="flex space-x-1 bg-orange-50/50 p-1 rounded-xl">
              {[
                { id: Tab.DASHBOARD, label: '대시보드', icon: <TrendingUp size={16} /> },
                { id: Tab.PLANNER, label: '사업 설정', icon: <Calculator size={16} /> },
                { id: Tab.COMPARISON, label: '계획 비교', icon: <Copy size={16} /> },
                { id: Tab.TODO, label: '준비물', icon: <CheckSquare size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-[#5d4037] shadow-sm ring-1 ring-orange-100' : 'text-slate-500 hover:text-[#5d4037]'}`}
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-[#fff9f5] border-b border-orange-100 py-2.5">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-[10px] font-black text-orange-300 uppercase whitespace-nowrap">Plan Presets:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {Object.keys(PLAN_PRESETS).map(name => (
                  <button 
                    key={name}
                    onClick={() => applyPreset(name)}
                    className="px-3 py-1 bg-white border border-orange-100 rounded-full text-[11px] font-bold text-[#5d4037] hover:border-orange-300 hover:bg-orange-50 transition-colors whitespace-nowrap shadow-sm"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-orange-50">
               <span className="text-[10px] font-black text-orange-300 uppercase whitespace-nowrap">Saved Plans:</span>
               <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {scenarios.map(s => (
                  <div key={s.id} className={`flex items-center bg-white border rounded-full pl-3 pr-1 h-7 shadow-sm transition-all ${activeScenarioId === s.id ? 'border-orange-500 ring-2 ring-orange-50' : 'border-orange-100'}`}>
                    <button onClick={() => loadScenario(s.id)} className={`text-[11px] font-bold mr-2 ${activeScenarioId === s.id ? 'text-orange-700' : 'text-[#5d4037]'}`}>
                      {s.name}
                    </button>
                    <button onClick={() => deleteScenario(s.id)} className="p-1 text-orange-200 hover:text-rose-500 rounded-full hover:bg-rose-50"><Trash2 size={12} /></button>
                  </div>
                ))}
                <button 
                  onClick={() => { const name = prompt("계획 이름을 입력하세요:"); if(name) saveCurrentScenario(name); }} 
                  className="px-3 h-7 bg-[#5d4037] text-white rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-md hover:bg-[#4e342e] transition-all"
                >
                  <Save size={12}/> 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === Tab.DASHBOARD && (
          <DashboardTab 
            monthlyData={monthlyData}
            totalInvestment={currentFinancials.totalInvestment}
            bepMonth={bepMonth}
          />
        )}
        
        {activeTab === Tab.PLANNER && (
          <PlannerTab 
            config={config}
            onConfigChange={(s, f, v) => setConfig(prev => ({...prev, [s]: {...prev[s], [f]: v}}))}
            onSupplyChange={(f, v) => setConfig(prev => ({...prev, cafeSupplies: {...prev.cafeSupplies, [f]: v}}))}
            monthlyData={monthlyData}
            dailySalesCount={currentFinancials.salesCount}
            cafeUnitCosts={cafeUnitCosts} 
            totalInvestment={currentFinancials.totalInvestment}
            calculatedLaborCost={currentFinancials.laborCost}
          />
        )}

        {activeTab === Tab.COMPARISON && (
          <ComparisonTab scenarios={scenarios} calculateFinancials={calculateFinancialsForScenario} />
        )}

        {activeTab === Tab.TODO && (
          <TodoTab todos={todos} onToggle={(id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))} />
        )}
      </main>
    </div>
  );
}
