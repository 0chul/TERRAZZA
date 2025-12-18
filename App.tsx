
import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Calculator,
  CheckSquare,
  TrendingUp,
} from 'lucide-react';

import { DEFAULT_CONFIG, INITIAL_TODOS } from './constants';
import { GlobalConfig, MonthlyData, TodoItem, CafeSupplies, CafeUnitCosts } from './types';
import { DashboardTab } from './components/DashboardTab';
import { PlannerTab } from './components/PlannerTab';
import { TodoTab } from './components/TodoTab';

enum Tab {
  DASHBOARD = 'dashboard',
  PLANNER = 'planner',
  TODO = 'todo',
}

// 2026 Labor Cost Constants
const WAGE_2026 = 10320;
const WEEKDAY_MONTHLY_RATE = 2156880; // 209h * 10320
const WEEKEND_MONTHLY_RATE = 861200;  // 83.45h * 10320 (rounded)

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [projectionMonths, setProjectionMonths] = useState(10);

  // --- Calculations ---

  // 1. Derived Daily Sales Count (Capacity Logic)
  const dailySalesCount = useMemo(() => {
    const { seatCount, operatingHours, stayDuration, turnoverTarget } = config.cafe;
    // Avoid division by zero
    const safeStayDuration = stayDuration > 0 ? stayDuration : 1;
    const maxDailyCapacity = seatCount * (operatingHours / safeStayDuration);
    return Math.round(maxDailyCapacity * turnoverTarget);
  }, [config.cafe]);

  // 1.5 Derived Labor Cost
  const calculatedLaborCost = useMemo(() => {
    const { weekdayStaff, weekendStaff, additionalLabor } = config.fixed;
    return (weekdayStaff * WEEKDAY_MONTHLY_RATE) + (weekendStaff * WEEKEND_MONTHLY_RATE) + additionalLabor;
  }, [config.fixed]);

  // 2. Helper: Calculate Cafe Unit Costs dynamically with 8-way branching
  const cafeUnitCosts: CafeUnitCosts = useMemo(() => {
    const { beanPricePerKg, milkPricePerL, takeoutRatio, iceRatio } = config.cafe;
    const s = config.cafeSupplies; 
    
    // Ingredients Cost
    const bean = (beanPricePerKg / 1000) * s.beanGrams;
    const milk = (milkPricePerL / 1000) * s.milkMl;
    const water = s.water;
    const ice = s.ice;
    const syrup = s.syrup;

    // Consumables Package Cost
    const packTakeoutHot = 
      s.hotCup + s.hotLid + s.stick + 
      s.holder + s.carrier + s.wipe + s.napkin;
    
    const packTakeoutIce = 
      s.iceCup + s.iceLid + s.straw + 
      s.holder + s.carrier + s.wipe + s.napkin;

    const packStoreHot = 
      s.stick + s.wipe + s.napkin + s.dishwashing;
      
    const packStoreIce = 
      s.straw + s.wipe + s.napkin + s.dishwashing;

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
  }, [config.cafe, config.cafeSupplies]);

  // 3. Monthly Financial Data
  const monthlyData: MonthlyData[] = useMemo(() => {
    const data: MonthlyData[] = [];
    const totalInitialCost =
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

      // Cost Breakdown
      const laborCost = calculatedLaborCost;
      const utilityCost = config.fixed.utilities;
      const otherFixedCost = 
        config.fixed.internet + 
        config.fixed.marketing + 
        config.fixed.maintenance + 
        config.fixed.misc;

      // Aggregations
      const totalRevenue = cafeRevenue + spaceRevenue + wineRevenue;
      const totalCOGS = cafeCOGS + spaceCOGS + wineCOGS;
      const grossProfit = totalRevenue - totalCOGS;

      const totalFixedCosts = laborCost + utilityCost + otherFixedCost;

      const netProfit = grossProfit - totalFixedCosts;

      cumulativeProfit += netProfit;

      data.push({
        month: m,
        cafeRevenue,
        spaceRevenue,
        wineRevenue,
        revenue: totalRevenue,
        
        // Detailed Costs
        cafeCOGS,
        wineCOGS,
        laborCost,
        utilityCost,
        otherFixedCost,

        cogs: totalCOGS,
        grossProfit,
        fixedCosts: totalFixedCosts,
        netProfit,
        cumulativeProfit,
      });
    }
    return data;
  }, [config, projectionMonths, cafeUnitCosts, dailySalesCount, calculatedLaborCost]);

  const bepMonth = useMemo(() => {
    const match = monthlyData.find(d => d.cumulativeProfit >= 0);
    return match ? `M+${match.month}` : '미도달';
  }, [monthlyData]);

  const totalInvestment = useMemo(() => {
    // Fix: Explicitly cast Object.values to number[] to handle type inference issues with reduce
    return (Object.values(config.initial) as number[]).reduce((a, b) => a + b, 0);
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

  const handleSupplyChange = (field: keyof CafeSupplies, value: number) => {
    setConfig(prev => ({
      ...prev,
      cafeSupplies: {
        ...prev.cafeSupplies,
        [field]: value
      }
    }));
  };

  // --- Render ---
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
        {activeTab === Tab.DASHBOARD && (
          <DashboardTab 
            monthlyData={monthlyData}
            totalInvestment={totalInvestment}
            bepMonth={bepMonth}
          />
        )}
        
        {activeTab === Tab.PLANNER && (
          <PlannerTab 
            config={config}
            onConfigChange={handleConfigChange}
            onSupplyChange={handleSupplyChange}
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
            onToggle={toggleTodo}
          />
        )}
      </main>
    </div>
  );
}
