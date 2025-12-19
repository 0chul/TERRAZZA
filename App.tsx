
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
  Layout,
  RefreshCw,
  RotateCcw,
  BookTemplate
} from 'lucide-react';

import { DEFAULT_CONFIG, INITIAL_TODOS, PLAN_PRESETS } from './constants';
import { GlobalConfig, MonthlyData, TodoItem, CafeUnitCosts, Scenario } from './types';
import { DashboardTab } from './components/DashboardTab';
import { PlannerTab } from './components/PlannerTab';
import { TodoTab } from './components/TodoTab';
import { ComparisonTab } from './components/ComparisonTab';
import { StrategyTab } from './components/StrategyTab';

enum Tab {
  DASHBOARD = 'dashboard',
  PLANNER = 'planner',
  COMPARISON = 'comparison',
  STRATEGY = 'strategy',
  TODO = 'todo',
}

const WEEKDAY_MONTHLY_RATE = 2156880; 
const WEEKEND_MONTHLY_RATE = 861200;  

// Helper for unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  
  // FIXED: Load current draft from localStorage or fallback to default preset
  const [config, setConfig] = useState<GlobalConfig>(() => {
    try {
      const savedDraft = localStorage.getItem('terrazza_current_draft');
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (e) {
      console.error("Failed to load draft", e);
    }
    const preset = PLAN_PRESETS["카페 집중형"];
    return { ...DEFAULT_CONFIG, ...preset };
  });

  // FIXED: Initialize scenarios lazily
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    try {
      const saved = localStorage.getItem('terrazza_scenarios');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load scenarios from localStorage", e);
      return [];
    }
  });

  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [projectionMonths, setProjectionMonths] = useState(12);

  // FIXED: Automatically persist current draft whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('terrazza_current_draft', JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save draft", e);
    }
  }, [config]);

  // FIXED: Automatically persist scenarios whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('terrazza_scenarios', JSON.stringify(scenarios));
    } catch (e) {
      console.error("Failed to save scenarios to localStorage", e);
    }
  }, [scenarios]);

  const saveCurrentScenario = (name: string) => {
    if (!name.trim()) return;
    const newScenario: Scenario = {
      id: generateId(),
      name,
      config: JSON.parse(JSON.stringify(config)),
      timestamp: Date.now()
    };
    setScenarios(prev => [...prev, newScenario]);
    setActiveScenarioId(newScenario.id);
  };

  const updateCurrentScenario = () => {
    if (!activeScenarioId) return;
    setScenarios(prev => prev.map(s => 
      s.id === activeScenarioId 
        ? { ...s, config: JSON.parse(JSON.stringify(config)), timestamp: Date.now() }
        : s
    ));
    alert("현재 계획이 업데이트되었습니다.");
  };

  const applyPreset = (presetName: string) => {
    if (window.confirm(`'${presetName}' 모델을 적용하시겠습니까?\n현재 입력된 값들이 선택한 표준 모델 값으로 변경됩니다.`)) {
      const preset = PLAN_PRESETS[presetName];
      if (preset) {
        setConfig(prev => ({ ...prev, ...preset }));
        setActiveScenarioId(null); // Presets are start of a new draft, so detach from saved ID
      }
    }
  };

  const loadScenario = (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      if (window.confirm(`'${scenario.name}' 계획을 불러오시겠습니까?`)) {
        setConfig(JSON.parse(JSON.stringify(scenario.config)));
        setActiveScenarioId(id);
      }
    }
  };

  const deleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("정말 이 계획을 삭제하시겠습니까?")) {
      setScenarios(prev => prev.filter(s => s.id !== id));
      if (activeScenarioId === id) setActiveScenarioId(null);
    }
  };

  const resetConfig = () => {
    if (window.confirm("현재 작업 중인 내용을 초기화하시겠습니까?\n저장되지 않은 변경사항은 삭제됩니다.")) {
       const preset = PLAN_PRESETS["카페 집중형"];
       setConfig({ ...DEFAULT_CONFIG, ...preset });
       setActiveScenarioId(null);
    }
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

  // Helper for Comparison Tab
  const calculateFinancialsForScenario = (cfg: GlobalConfig) => {
    // Re-calculate unit costs locally for the scenario
    const tempUc = (() => {
      const { beanPricePerKg, milkPricePerL, iceRatio, takeoutRatio } = cfg.cafe;
      const s = cfg.cafeSupplies;
      const bean = (beanPricePerKg / 1000) * s.beanGrams;
      const milk = (milkPricePerL / 1000) * s.milkMl;
      const water = s.water;
      const ice = s.ice;
      const syrup = s.syrup;
      const getMenuCost = (menu: string, type: string, temp: string) => {
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
          return (toI * iceRatio + toH * (1 - iceRatio)) * takeoutRatio + (stI * iceRatio + stH * (1 - iceRatio)) * (1 - takeoutRatio);
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
    <div className="min-h-screen bg-[#fdfcfb] font-sans text-[#3e2723]">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-[#5d4037] rounded-xl shadow-lg">
                <Layout className="text-white" size={24} />
              </div>
              <div className="border-l border-orange-100 pl-4 py-1">
                <span className="font-bold text-lg tracking-tight block leading-tight text-[#5d4037]">Terrazza Lounge</span>
                <span className="text-[10px] text-orange-600 font-black uppercase tracking-[0.2em]">Business Planner</span>
              </div>
            </div>
            
            <nav className="flex space-x-1 bg-orange-50/70 p-1 rounded-xl overflow-x-auto">
              {[
                { id: Tab.DASHBOARD, label: '대시보드', icon: <TrendingUp size={16} /> },
                { id: Tab.PLANNER, label: '상세 설정', icon: <Calculator size={16} /> },
                { id: Tab.COMPARISON, label: '계획 비교', icon: <Copy size={16} /> },
                { id: Tab.STRATEGY, label: 'AI 전략', icon: <Sparkles size={16} /> },
                { id: Tab.TODO, label: '준비물', icon: <CheckSquare size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'bg-[#5d4037] text-white shadow-md' : 'text-slate-500 hover:text-[#5d4037] hover:bg-white'}`}
                >
                  {tab.icon}
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-[#fff9f5] border-b border-orange-100 py-2.5">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left Side: Standard Models (Presets) */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-1">
                 <BookTemplate size={12}/> Standard Models:
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {Object.keys(PLAN_PRESETS).map(name => (
                  <button 
                    key={name}
                    onClick={() => applyPreset(name)}
                    className="px-3 py-1 bg-white border border-orange-200 rounded-lg text-[10px] font-bold text-[#5d4037] hover:bg-orange-50 hover:border-orange-500 transition-all shadow-sm whitespace-nowrap"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side: Saved Plans & Draft Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-2.5 md:pt-0 border-orange-100">
               <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-1">
                 <Copy size={12}/> My Plans:
               </span>
               
               {/* Saved Scenarios List */}
               <div className="flex gap-1.5 overflow-x-auto scrollbar-hide items-center max-w-[200px] lg:max-w-none">
                {scenarios.map(s => (
                  <div key={s.id} className={`flex items-center bg-white border rounded-lg pl-2 pr-1 h-7 shadow-sm transition-all group ${activeScenarioId === s.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-orange-100 text-slate-600'}`}>
                    <button onClick={() => loadScenario(s.id)} className="text-[10px] font-bold mr-1 whitespace-nowrap">
                      {s.name}
                    </button>
                    <button onClick={(e) => deleteScenario(s.id, e)} className="p-0.5 text-orange-200 hover:text-rose-500 rounded hover:bg-rose-50 transition-colors"><Trash2 size={10} /></button>
                  </div>
                ))}
                {scenarios.length === 0 && <span className="text-[10px] text-gray-400 italic">저장된 계획 없음</span>}
               </div>
                
                {/* Current Draft Action Buttons */}
                <div className="flex items-center gap-1 ml-2 border-l border-orange-200 pl-3">
                   {/* Reset Button: Contextually placed with current draft actions */}
                   <button 
                      onClick={resetConfig}
                      className="px-2 h-7 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm hover:bg-slate-200 transition-all whitespace-nowrap"
                      title="입력값 초기화 (현재 드래프트 비우기)"
                    >
                      <RotateCcw size={10} />
                   </button>

                   {activeScenarioId && (
                    <button 
                      onClick={updateCurrentScenario}
                      className="px-2 h-7 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm hover:bg-emerald-700 transition-all whitespace-nowrap"
                      title="현재 계획 덮어쓰기"
                    >
                      <RefreshCw size={10}/>
                    </button>
                   )}
                   <button 
                    onClick={() => { const name = prompt("새로운 계획 이름을 입력하세요:"); if(name) saveCurrentScenario(name); }} 
                    className="px-3 h-7 bg-[#5d4037] text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#4e342e] transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                   >
                    <Plus size={12}/> {activeScenarioId ? '새로 저장' : '저장'}
                   </button>
                </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-16">
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

        {/* FIXED: Passed currentConfig to ComparisonTab to allow real-time comparison */}
        {activeTab === Tab.COMPARISON && (
          <ComparisonTab 
            scenarios={scenarios} 
            currentConfig={config}
            calculateFinancials={calculateFinancialsForScenario} 
          />
        )}

        {activeTab === Tab.STRATEGY && (
          <StrategyTab config={config} financials={currentFinancials} bepMonth={bepMonth} />
        )}

        {activeTab === Tab.TODO && (
          <TodoTab todos={todos} onToggle={(id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))} />
        )}
      </main>
    </div>
  );
}
