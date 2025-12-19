
import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Calculator,
  CheckSquare,
  TrendingUp,
  Sparkles,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

import { DEFAULT_CONFIG, INITIAL_TODOS } from './constants';
import { GlobalConfig, MonthlyData, TodoItem, CafeSupplies, CafeUnitCosts, BusinessReport } from './types';
import { DashboardTab } from './components/DashboardTab';
import { PlannerTab } from './components/PlannerTab';
import { TodoTab } from './components/TodoTab';

enum Tab {
  DASHBOARD = 'dashboard',
  PLANNER = 'planner',
  TODO = 'todo',
}

const WAGE_2026 = 10320;
const WEEKDAY_MONTHLY_RATE = 2156880; 
const WEEKEND_MONTHLY_RATE = 861200;  

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [projectionMonths, setProjectionMonths] = useState(10);
  const [report, setReport] = useState<BusinessReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const dailySalesCount = useMemo(() => {
    const { seatCount, operatingHours, stayDuration, turnoverTarget } = config.cafe;
    const safeStayDuration = stayDuration > 0 ? stayDuration : 1;
    const maxDailyCapacity = seatCount * (operatingHours / safeStayDuration);
    return Math.round(maxDailyCapacity * turnoverTarget);
  }, [config.cafe]);

  const calculatedLaborCost = useMemo(() => {
    const { weekdayStaff, weekendStaff, additionalLabor } = config.fixed;
    return (weekdayStaff * WEEKDAY_MONTHLY_RATE) + (weekendStaff * WEEKEND_MONTHLY_RATE) + additionalLabor;
  }, [config.fixed]);

  const cafeUnitCosts: CafeUnitCosts = useMemo(() => {
    const { beanPricePerKg, milkPricePerL, takeoutRatio, iceRatio } = config.cafe;
    const s = config.cafeSupplies; 
    const bean = (beanPricePerKg / 1000) * s.beanGrams;
    const milk = (milkPricePerL / 1000) * s.milkMl;
    const water = s.water;
    const ice = s.ice;
    const syrup = s.syrup;

    const packTakeoutHot = s.hotCup + s.hotLid + s.stick + s.holder + s.carrier + s.wipe + s.napkin;
    const packTakeoutIce = s.iceCup + s.iceLid + s.straw + s.holder + s.carrier + s.wipe + s.napkin;
    const packStoreHot = s.stick + s.wipe + s.napkin + s.dishwashing;
    const packStoreIce = s.straw + s.wipe + s.napkin + s.dishwashing;

    const products = {
        takeout: {
            hot: { americano: packTakeoutHot + bean + water, latte: packTakeoutHot + bean + milk, syrupLatte: packTakeoutHot + bean + milk + syrup },
            ice: { americano: packTakeoutIce + bean + water + ice, latte: packTakeoutIce + bean + milk + ice, syrupLatte: packTakeoutIce + bean + milk + ice + syrup }
        },
        store: {
            hot: { americano: packStoreHot + bean + water, latte: packStoreHot + bean + milk, syrupLatte: packStoreHot + bean + milk + syrup },
            ice: { americano: packStoreIce + bean + water + ice, latte: packStoreIce + bean + milk + ice, syrupLatte: packStoreIce + bean + milk + ice + syrup }
        }
    };

    const avgTakeoutAm = products.takeout.ice.americano * iceRatio + products.takeout.hot.americano * (1 - iceRatio);
    const avgTakeoutLatte = products.takeout.ice.latte * iceRatio + products.takeout.hot.latte * (1 - iceRatio);
    const avgTakeoutSyrup = products.takeout.ice.syrupLatte * iceRatio + products.takeout.hot.syrupLatte * (1 - iceRatio);
    const avgStoreAm = products.store.ice.americano * iceRatio + products.store.hot.americano * (1 - iceRatio);
    const avgStoreLatte = products.store.ice.latte * iceRatio + products.store.hot.latte * (1 - iceRatio);
    const avgStoreSyrup = products.store.ice.syrupLatte * iceRatio + products.store.hot.syrupLatte * (1 - iceRatio);

    const finalCostAmericano = (avgTakeoutAm * takeoutRatio) + (avgStoreAm * (1 - takeoutRatio));
    const finalCostLatte = (avgTakeoutLatte * takeoutRatio) + (avgStoreLatte * (1 - takeoutRatio));
    const finalCostSyrupLatte = (avgTakeoutSyrup * takeoutRatio) + (avgStoreSyrup * (1 - takeoutRatio));

    return { unitCosts: { bean, milk, water, ice, syrup }, finalCostAmericano, finalCostLatte, finalCostSyrupLatte, products };
  }, [config.cafe, config.cafeSupplies]);

  const monthlyData: MonthlyData[] = useMemo(() => {
    const data: MonthlyData[] = [];
    const totalInitialCost = config.initial.interior + config.initial.equipment + config.initial.design + config.initial.supplies;
    let cumulativeProfit = -totalInitialCost;

    for (let m = 1; m <= projectionMonths; m++) {
      const weightedAvgPrice = config.cafe.avgPriceAmericano * config.cafe.ratioAmericano + config.cafe.avgPriceLatte * config.cafe.ratioLatte + config.cafe.avgPriceSyrupLatte * config.cafe.ratioSyrupLatte;
      const cafeRevenue = weightedAvgPrice * dailySalesCount * config.cafe.operatingDays;
      const weightedAvgCost = cafeUnitCosts.finalCostAmericano * config.cafe.ratioAmericano + cafeUnitCosts.finalCostLatte * config.cafe.ratioLatte + cafeUnitCosts.finalCostSyrupLatte * config.cafe.ratioSyrupLatte;
      const cafeCOGS = weightedAvgCost * dailySalesCount * config.cafe.operatingDays;
      const spaceRevenue = config.space.hourlyRate * config.space.hoursPerDay * config.space.utilizationRate * config.space.operatingDays;
      const wineRevenue = config.wine.avgTicketPrice * config.wine.dailyTables * config.wine.operatingDays;
      const wineCOGS = wineRevenue * config.wine.costOfGoodsSoldRate;
      const laborCost = calculatedLaborCost;
      const utilityCost = config.fixed.utilities;
      const otherFixedCost = config.fixed.internet + config.fixed.marketing + config.fixed.maintenance + config.fixed.misc;
      const totalRevenue = cafeRevenue + spaceRevenue + wineRevenue;
      const totalCOGS = cafeCOGS + wineCOGS;
      const grossProfit = totalRevenue - totalCOGS;
      const totalFixedCosts = laborCost + utilityCost + otherFixedCost;
      const netProfit = grossProfit - totalFixedCosts;
      cumulativeProfit += netProfit;

      data.push({
        month: m, cafeRevenue, spaceRevenue, wineRevenue, revenue: totalRevenue,
        cafeCOGS, wineCOGS, laborCost, utilityCost, otherFixedCost,
        cogs: totalCOGS, grossProfit, fixedCosts: totalFixedCosts, netProfit, cumulativeProfit,
      });
    }
    return data;
  }, [config, projectionMonths, cafeUnitCosts, dailySalesCount, calculatedLaborCost]);

  const generateAIReport = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        As a senior business consultant, provide a detailed strategy and P&L analysis for this "Cafe + Space Rental + Wine Bar" hybrid business.
        
        DATA:
        - Monthly Revenue: ₩${Math.round(monthlyData[0].revenue).toLocaleString()}
        - Net Profit: ₩${Math.round(monthlyData[0].netProfit).toLocaleString()}
        - Initial Investment: ₩${(config.initial.interior + config.initial.equipment).toLocaleString()}
        - Cafe Turnover Rate: ${config.cafe.turnoverTarget * 100}%
        - Space Utilization: ${config.space.utilizationRate * 100}%
        - Wine Bar Tables: ${config.wine.dailyTables} teams/day
        
        PLEASE PROVIDE:
        1. SWOT Analysis for this hybrid model.
        2. Financial Risk Assessment (based on the net profit margin).
        3. Actionable Strategic Recommendations to optimize the mix of the 3 businesses.
        
        Use professional tone. Response language: Korean.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setReport({
        content: response.text || "No response received.",
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Report generation failed. Please check your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const bepMonth = useMemo(() => {
    const match = monthlyData.find(d => d.cumulativeProfit >= 0);
    return match ? `M+${match.month}` : '미도달';
  }, [monthlyData]);

  const totalInvestment = useMemo(() => {
    return (Object.values(config.initial) as number[]).reduce((a, b) => a + b, 0);
  }, [config.initial]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Coffee className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">BizPlanner <span className="text-blue-600 font-light">3-in-1</span></span>
            </div>
            
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: Tab.DASHBOARD, label: '대시보드', icon: <TrendingUp size={16} /> },
                { id: Tab.PLANNER, label: '계획 설정', icon: <Calculator size={16} /> },
                { id: Tab.TODO, label: '체크리스트', icon: <CheckSquare size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === Tab.DASHBOARD && (
          <DashboardTab 
            monthlyData={monthlyData}
            totalInvestment={totalInvestment}
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
            dailySalesCount={dailySalesCount}
            cafeUnitCosts={cafeUnitCosts}
            totalInvestment={totalInvestment}
            calculatedLaborCost={calculatedLaborCost}
          />
        )}

        {activeTab === Tab.TODO && (
          <TodoTab 
            todos={todos}
            onToggle={(id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))}
          />
        )}
      </main>
    </div>
  );
}
