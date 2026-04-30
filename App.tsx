
import React, { useState, useMemo, useEffect } from 'react';
import {
  Coffee,
  Calculator,
  CheckSquare,
  TrendingUp,
  Trash2,
  Plus,
  BarChart2,
  Save,
  Copy,
  Layout,
  RefreshCw,
  RotateCcw,
  Database,
  Presentation
} from 'lucide-react';

import { DEFAULT_CONFIG, INITIAL_TODOS } from './constants';
import { DEFAULT_INTERIOR_COSTS } from './defaultInteriorCosts';
import { GlobalConfig, MonthlyData, TodoItem, CafeUnitCosts, Scenario, InteriorCost } from './types';
import { DashboardTab } from './components/DashboardTab';
import { PlannerTab } from './components/PlannerTab';
import { BusinessPlanTab } from './components/BusinessPlanTab';
import { InteriorCostTab } from './components/InteriorCostTab';
import { dbService } from './db';

enum Tab {
  PLAN = 'plan',
  DASHBOARD = 'dashboard',
  PLANNER = 'planner',
  INTERIOR = 'interior',
}

const WEEKDAY_MONTHLY_RATE = 2156880; 
const WEEKEND_MONTHLY_RATE = 861200;  

// Helper for unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PLAN);
  
  // Load current draft from localStorage or fallback to DEFAULT_CONFIG (Cafe Focused)
  const [config, setConfig] = useState<GlobalConfig>(() => {
    try {
      const savedDraft = localStorage.getItem('terrazza_current_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.cafe && parsed.cafe.seatCount === 60) {
          parsed.cafe.seatCount = 30; // Apply new default for existing drafts
        }
        if (parsed.initial && parsed.initial.interior === 60000000) {
          parsed.initial.interior = 12810950;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load draft", e);
    }
    return { ...DEFAULT_CONFIG };
  });

  // Load scenarios from Database
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [interiorCosts, setInteriorCosts] = useState<InteriorCost[]>([]);

  useEffect(() => {
    // Initial load from DB
    const loadData = async () => {
      try {
        const [loadedPlans, loadedCosts] = await Promise.all([
          dbService.getAllPlans(),
          dbService.getAllInteriorCosts()
        ]);
        setScenarios(loadedPlans);
        
        const oldSum = loadedCosts.reduce((acc, curr) => acc + curr.cost, 0);
        
        if (loadedCosts.length === 0 || oldSum === 13768520) {
          await dbService.clearInteriorCosts();
          for (const item of DEFAULT_INTERIOR_COSTS) {
            await dbService.saveInteriorCost(item as InteriorCost);
          }
          setInteriorCosts(DEFAULT_INTERIOR_COSTS as InteriorCost[]);
        } else {
          setInteriorCosts(loadedCosts);
        }
      } catch (e) {
        console.error("Failed to load data from DB", e);
      }
    };
    loadData();
  }, [activeTab]); // Refresh when switching tabs as Interior tab modifies DB

  const totalInteriorExpenses = useMemo(() => {
    return interiorCosts.reduce((sum, c) => sum + c.cost, 0);
  }, [interiorCosts]);

  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [projectionMonths, setProjectionMonths] = useState(12);

  // Automatically persist current draft whenever it changes (auto-save draft only)
  useEffect(() => {
    try {
      localStorage.setItem('terrazza_current_draft', JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save draft", e);
    }
  }, [config]);

  const saveCurrentScenario = async (name: string) => {
    if (!name.trim()) return;
    const newScenario: Scenario = {
      id: generateId(),
      name,
      config: JSON.parse(JSON.stringify(config)),
      timestamp: Date.now()
    };
    
    try {
      await dbService.savePlan(newScenario);
      setScenarios(prev => [...prev, newScenario]);
      setActiveScenarioId(newScenario.id);
    } catch (e) {
      alert("DB 저장 실패");
    }
  };

  const updateCurrentScenario = async () => {
    if (!activeScenarioId) return;
    const updatedScenario: Scenario = {
      id: activeScenarioId,
      name: scenarios.find(s => s.id === activeScenarioId)?.name || 'Unknown',
      config: JSON.parse(JSON.stringify(config)),
      timestamp: Date.now()
    };

    try {
      await dbService.savePlan(updatedScenario);
      setScenarios(prev => prev.map(s => s.id === activeScenarioId ? updatedScenario : s));
      alert("현재 계획이 DB에 업데이트되었습니다.");
    } catch (e) {
      alert("DB 업데이트 실패");
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

  const deleteScenario = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("정말 이 계획을 삭제하시겠습니까?")) {
      try {
        await dbService.deletePlan(id);
        setScenarios(prev => prev.filter(s => s.id !== id));
        if (activeScenarioId === id) setActiveScenarioId(null);
      } catch (err) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const resetConfig = () => {
    if (window.confirm("현재 작업 중인 내용을 초기화하시겠습니까?\n저장되지 않은 변경사항은 삭제됩니다.")) {
       setConfig({ ...DEFAULT_CONFIG });
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
    const totalInvestment = totalInteriorExpenses;

    return { totalRevenue, netProfit, totalInvestment, salesCount, cafeRevenue, spaceRevenue, wineRevenue, laborCost, totalFixed, cafeCOGS, wineCOGS, totalCOGS };
  };

  const currentFinancials = useMemo(() => calculateFinancials(config, cafeUnitCosts), [config, cafeUnitCosts, totalInteriorExpenses]);

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

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-[var(--dark)] border-b border-[rgba(201,150,58,0.2)] shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col w-full gap-4 py-4">
            <div className="flex justify-between items-center w-full px-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[var(--charcoal)] border border-[rgba(201,150,58,0.3)] rounded-lg shadow-sm">
                  <Layout className="text-[var(--amber)]" size={20} />
                </div>
                <div className="border-l border-[rgba(201,150,58,0.2)] pl-3">
                  <span className="font-bold text-base tracking-tight block leading-tight text-[var(--cream)]" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.1em" }}>Terrazza Lounge</span>
                  <span className="text-[9px] text-[var(--amber)] font-black uppercase tracking-[0.2em]">Business Planner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <nav className="flex flex-wrap gap-1 border p-1.5 rounded-xl justify-center mx-4 sticky top-0 z-50 shadow-sm backdrop-blur-md mt-4" style={{background: 'rgba(42, 36, 32, 0.6)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>
        {[
          { id: Tab.PLAN, label: '사업계획', icon: <Presentation size={14} /> },
          { id: Tab.DASHBOARD, label: '재무계획', icon: <TrendingUp size={14} /> },
          { id: Tab.PLANNER, label: '상세 설정', icon: <Calculator size={14} /> },
          { id: Tab.INTERIOR, label: '인테리어', icon: <Calculator size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'bg-[var(--amber)] text-[var(--black)] shadow-sm' : 'text-[var(--mist)] hover:text-[var(--amber)] hover:bg-[rgba(201,150,58,0.1)]'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="bg-[var(--dark)] border-b border-t border-[rgba(201,150,58,0.1)] py-2.5 mt-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-between gap-4">
          
          {/* Right Side: Saved Plans & Draft Actions */}
          <div className="flex flex-col md:flex-row items-center gap-3 w-full border-t md:border-t-0 pt-2.5 md:pt-0 border-[rgba(201,150,58,0.1)]">
             <span className="text-[10px] font-black text-[var(--amber)] uppercase tracking-widest whitespace-nowrap flex items-center gap-1">
               <Copy size={12}/> My Plans (DB):
             </span>
             
             {/* Saved Scenarios List */}
             <div className="flex gap-1.5 overflow-x-auto scrollbar-hide items-center w-full md:max-w-none">
              {scenarios.map(s => (
                <div key={s.id} className={`flex items-center bg-[var(--charcoal)] border rounded-lg pl-2 pr-1 h-7 shadow-sm transition-all group ${activeScenarioId === s.id ? 'border-[var(--amber)] text-[var(--amber)]' : 'border-[rgba(201,150,58,0.2)] text-[var(--mist)]'}`}>
                  <button onClick={() => loadScenario(s.id)} className="text-[10px] font-bold mr-1 whitespace-nowrap">
                    {s.name}
                  </button>
                  <button onClick={(e) => deleteScenario(s.id, e)} className="p-0.5 text-[var(--mist)] hover:text-red-400 rounded hover:bg-red-400/10 transition-colors"><Trash2 size={10} /></button>
                </div>
              ))}
              {scenarios.length === 0 && <span className="text-[10px] text-[var(--stone)] nitalic">저장된 계획 없음</span>}
             </div>
              
              {/* Current Draft Action Buttons */}
              <div className="flex items-center gap-1 md:ml-2 border-t md:border-t-0 md:border-l pt-2.5 md:pt-0 md:pl-3 w-full md:w-auto justify-center" style={{borderColor: 'rgba(201, 150, 58, 0.1)'}}>
                 {/* Reset Button */}
                 <button 
                    onClick={resetConfig}
                    className="px-2 h-7 rounded-lg text-[10px] border flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
                    title="입력값 초기화 (현재 드래프트 리셋)"
                    style={{background: 'var(--charcoal)', color: 'var(--mist)', borderColor: 'rgba(201, 150, 58, 0.2)'}}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 150, 58, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--charcoal)'}
                  >
                    <RotateCcw size={10} />
                 </button>

                 {activeScenarioId && (
                  <button 
                    onClick={updateCurrentScenario}
                    className="px-2 h-7 border rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
                    title="현재 계획 DB 업데이트"
                    style={{background: 'rgba(201, 150, 58, 0.1)', color: 'var(--amber)', borderColor: 'rgba(201, 150, 58, 0.3)'}}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 150, 58, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201, 150, 58, 0.1)'}
                  >
                    <RefreshCw size={10}/>
                  </button>
                 )}
                 <button 
                  onClick={() => { const name = prompt("새로운 계획 이름을 입력하세요:"); if(name) saveCurrentScenario(name); }} 
                  className="px-3 h-7 bg-[var(--amber)] text-[var(--black)] rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-[var(--amber-light)] transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                 >
                  <Plus size={12}/> {activeScenarioId ? '새로 저장' : 'DB 저장'}
                 </button>
              </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-16">
        {activeTab === Tab.PLAN && (
          <BusinessPlanTab totalInteriorExpenses={totalInteriorExpenses} config={config} cafeUnitCosts={cafeUnitCosts} />
        )}

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
        
        {activeTab === Tab.INTERIOR && (
          <InteriorCostTab />
        )}
      </main>
    </div>
  );
}
