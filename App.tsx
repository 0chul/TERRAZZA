
import React, { useState, useMemo, useEffect } from 'react';
import {
  Coffee,
  Calculator,
  CheckSquare,
  TrendingUp,
  Sparkles,
  Trash2,
  Plus,
  BarChart2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

import { DEFAULT_CONFIG, INITIAL_TODOS } from './constants';
import { GlobalConfig, MonthlyData, TodoItem, CafeUnitCosts, BusinessReport, Scenario } from './types';
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
  const [projectionMonths, setProjectionMonths] = useState(10);
  const [report, setReport] = useState<BusinessReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bizplanner_scenarios');
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
    localStorage.setItem('bizplanner_scenarios', JSON.stringify(updated));
    setActiveScenarioId(newScenario.id);
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
    localStorage.setItem('bizplanner_scenarios', JSON.stringify(updated));
    if (activeScenarioId === id) setActiveScenarioId(null);
  };

  const calculateFinancials = (cfg: GlobalConfig) => {
    const { seatCount, operatingHours, stayDuration, turnoverTarget, beanPricePerKg, milkPricePerL, takeoutRatio, iceRatio, ratioAmericano, ratioLatte, ratioSyrupLatte, avgPriceAmericano, avgPriceLatte, avgPriceSyrupLatte, operatingDays: cafeDays } = cfg.cafe;
    const { hourlyRate, hoursPerDay, operatingDays: spaceDays, utilizationRate } = cfg.space;
    const { avgTicketPrice, dailyTables, operatingDays: wineDays, costOfGoodsSoldRate } = cfg.wine;
    const { weekdayStaff, weekendStaff, additionalLabor, utilities, internet, marketing, maintenance, misc } = cfg.fixed;
    const s = cfg.cafeSupplies;

    const safeStayDuration = stayDuration > 0 ? stayDuration : 1;
    const maxDailyCapacity = seatCount * (operatingHours / safeStayDuration);
    const salesCount = Math.round(maxDailyCapacity * turnoverTarget);

    const laborCost = (weekdayStaff * WEEKDAY_MONTHLY_RATE) + (weekendStaff * WEEKEND_MONTHLY_RATE) + additionalLabor;
    
    const bean = (beanPricePerKg / 1000) * s.beanGrams;
    const milk = (milkPricePerL / 1000) * s.milkMl;
    const packTakeoutHot = s.hotCup + s.hotLid + s.stick + s.holder + s.carrier + s.wipe + s.napkin;
    const packTakeoutIce = s.iceCup + s.iceLid + s.straw + s.holder + s.carrier + s.wipe + s.napkin;
    const packStoreHot = s.stick + s.wipe + s.napkin + s.dishwashing;
    const packStoreIce = s.straw + s.wipe + s.napkin + s.dishwashing;

    const getCost = (menu: 'am' | 'lt' | 'sl', type: 'to' | 'st', temp: 'h' | 'i') => {
      let ing = bean;
      if (menu === 'am') ing += s.water;
      else if (menu === 'lt') ing += milk;
      else ing += milk + s.syrup;
      if (temp === 'i') ing += s.ice;

      let pkg = 0;
      if (type === 'to') pkg = temp === 'h' ? packTakeoutHot : packTakeoutIce;
      else pkg = temp === 'h' ? packStoreHot : packStoreIce;
      return ing + pkg;
    };

    const finalCostAm = (getCost('am', 'to', 'i') * iceRatio + getCost('am', 'to', 'h') * (1-iceRatio)) * takeoutRatio + (getCost('am', 'st', 'i') * iceRatio + getCost('am', 'st', 'h') * (1-iceRatio)) * (1-takeoutRatio);
    const finalCostLt = (getCost('lt', 'to', 'i') * iceRatio + getCost('lt', 'to', 'h') * (1-iceRatio)) * takeoutRatio + (getCost('lt', 'st', 'i') * iceRatio + getCost('lt', 'st', 'h') * (1-iceRatio)) * (1-takeoutRatio);
    const finalCostSl = (getCost('sl', 'to', 'i') * iceRatio + getCost('sl', 'to', 'h') * (1-iceRatio)) * takeoutRatio + (getCost('sl', 'st', 'i') * iceRatio + getCost('sl', 'st', 'h') * (1-iceRatio)) * (1-takeoutRatio);

    const weightedAvgPrice = avgPriceAmericano * ratioAmericano + avgPriceLatte * ratioLatte + avgPriceSyrupLatte * ratioSyrupLatte;
    const weightedAvgCost = finalCostAm * ratioAmericano + finalCostLt * ratioLatte + finalCostSl * ratioSyrupLatte;

    const cafeRevenue = weightedAvgPrice * salesCount * cafeDays;
    const cafeCOGS = weightedAvgCost * salesCount * cafeDays;
    const spaceRevenue = hourlyRate * hoursPerDay * utilizationRate * spaceDays;
    const wineRevenue = avgTicketPrice * dailyTables * wineDays;
    const wineCOGS = wineRevenue * costOfGoodsSoldRate;
    const totalRevenue = cafeRevenue + spaceRevenue + wineRevenue;
    const totalCOGS = cafeCOGS + wineCOGS;
    const totalFixed = laborCost + utilities + internet + marketing + maintenance + misc;
    const netProfit = (totalRevenue - totalCOGS) - totalFixed;
    const totalInvestment = Object.values(cfg.initial).reduce((a, b) => (a as number) + (b as number), 0);

    return { totalRevenue, netProfit, totalInvestment, salesCount, cafeRevenue, spaceRevenue, wineRevenue, laborCost, totalFixed };
  };

  const currentFinancials = useMemo(() => calculateFinancials(config), [config]);

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
        cafeCOGS: 0, wineCOGS: 0, laborCost: currentFinancials.laborCost, utilityCost: 0, otherFixedCost: 0,
        cogs: 0, grossProfit: 0, fixedCosts: currentFinancials.totalFixed,
        netProfit: currentFinancials.netProfit,
        cumulativeProfit,
      });
    }
    return data;
  }, [currentFinancials, projectionMonths]);

  const generateAIReport = async () => {
    if (!process.env.API_KEY) {
      alert("API Key가 설정되어 있지 않습니다.");
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `사업 기획서 분석: 카페/공간대여/와인바 복합 모델. 월 매출 ₩${Math.round(currentFinancials.totalRevenue).toLocaleString()}, 순이익 ₩${Math.round(currentFinancials.netProfit).toLocaleString()}. 이 데이터에 기반한 SWOT 분석과 핵심 성공 전략 3가지를 한국어로 작성해줘.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setReport({ content: response.text || "분석 실패", timestamp: new Date().toLocaleTimeString() });
    } catch (error) {
      alert("AI 리포트 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const bepMonth = useMemo(() => {
    const match = monthlyData.find(d => d.cumulativeProfit >= 0);
    return match ? `M+${match.month}` : '미도달';
  }, [monthlyData]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Coffee className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">BizPlanner</span>
            </div>
            
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
              {[
                { id: Tab.DASHBOARD, label: '대시보드', icon: <TrendingUp size={16} /> },
                { id: Tab.PLANNER, label: '계획 설정', icon: <Calculator size={16} /> },
                { id: Tab.COMPARISON, label: '비교 분석', icon: <BarChart2 size={16} /> },
                { id: Tab.TODO, label: '체크리스트', icon: <CheckSquare size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-gray-50 border-b border-gray-200 py-2">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">My Scenarios:</span>
              <div className="flex gap-1">
                {scenarios.map(s => (
                  <div key={s.id} className="flex items-center bg-white border rounded h-7 shadow-xs">
                    <button onClick={() => loadScenario(s.id)} className={`px-2 text-[11px] font-medium ${activeScenarioId === s.id ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                      {s.name}
                    </button>
                    <button onClick={() => deleteScenario(s.id)} className="px-1.5 text-gray-300 hover:text-red-500"><Trash2 size={10} /></button>
                  </div>
                ))}
                <button onClick={() => { const name = prompt("이름:"); if(name) saveCurrentScenario(name); }} className="px-2 h-7 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[11px] font-bold flex items-center gap-1">
                  <Plus size={10}/> 저장
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
            onGenerateReport={generateAIReport}
            isGenerating={isGenerating}
            report={report}
          />
        )}
        
        {activeTab === Tab.PLANNER && (
          <PlannerTab 
            config={config}
            onConfigChange={(s, f, v) => setConfig(prev => ({...prev, [s]: {...prev[s], [f]: v}}))}
            onSupplyChange={(f, v) => setConfig(prev => ({...prev, cafeSupplies: {...prev.cafeSupplies, [f]: v}}))}
            monthlyData={monthlyData}
            dailySalesCount={currentFinancials.salesCount}
            cafeUnitCosts={{} as any} // Simplify for focus on deployment
            totalInvestment={currentFinancials.totalInvestment}
            calculatedLaborCost={currentFinancials.laborCost}
          />
        )}

        {activeTab === Tab.COMPARISON && (
          <ComparisonTab scenarios={scenarios} calculateFinancials={calculateFinancials} />
        )}

        {activeTab === Tab.TODO && (
          <TodoTab todos={todos} onToggle={(id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))} />
        )}
      </main>
    </div>
  );
}
