
export interface CafeConfig {
  avgPriceAmericano: number;
  avgPriceLatte: number;
  avgPriceSyrupLatte: number; // For Vanilla Latte, Caramel Macchiato, etc.
  beanPricePerKg: number; 
  milkPricePerL: number; 
  
  // Dynamic Capacity Logic
  seatCount: number;      // Total seats
  operatingHours: number; // Daily open hours
  stayDuration: number;   // Avg hours per customer
  turnoverTarget: number; // 0.0 to 1.0 (Turnover rate)

  ratioAmericano: number; 
  ratioLatte: number;     // Explicit ratio for Cafe Latte
  ratioSyrupLatte: number; // Explicit ratio for Syrup Latte
  takeoutRatio: number;   
  iceRatio: number;       
  operatingDays: number;
}

export interface CafeSupplies {
  hotCup: number;
  hotLid: number;
  stick: number;
  iceCup: number;
  iceLid: number;
  straw: number;
  holder: number;
  carrier: number;
  wipe: number;
  napkin: number;
  dishwashing: number;
  
  water: number;
  ice: number;
  syrup: number;
  
  beanGrams: number;
  milkMl: number;
}

export interface SpaceConfig {
  hourlyRate: number;
  hoursPerDay: number;
  operatingDays: number;
  utilizationRate: number; 
}

export interface WineConfig {
  avgTicketPrice: number; 
  costOfGoodsSoldRate: number; 
  dailyTables: number;
  operatingDays: number;
  utilizationRate?: number; // Optional if needed for wine later
}

export interface FixedCosts {
  weekdayStaff: number;  // Number of weekday full-time staff
  weekendStaff: number;  // Number of weekend staff
  additionalLabor: number; // Bonus/Management/Owner draw
  utilities: number;
  internet: number;
  marketing: number;
  maintenance: number;
  misc: number;
}

export interface InitialInvestment {
  interior: number;
  equipment: number;
  design: number;
  supplies: number;
}

export interface MonthlyData {
  month: number;
  // Revenue Breakdown
  cafeRevenue: number;
  spaceRevenue: number;
  wineRevenue: number;
  
  // Cost Breakdown
  cafeCOGS: number;
  wineCOGS: number;
  laborCost: number;
  utilityCost: number;
  otherFixedCost: number;

  // Aggregates
  revenue: number;
  cogs: number;
  grossProfit: number;
  fixedCosts: number;
  netProfit: number;
  cumulativeProfit: number;
}

export interface GlobalConfig {
  cafe: CafeConfig;
  cafeSupplies: CafeSupplies;
  space: SpaceConfig;
  wine: WineConfig;
  fixed: FixedCosts;
  initial: InitialInvestment;
}

export interface TodoItem {
  id: string;
  category: string;
  task: string;
  note?: string;
  completed: boolean;
}

export interface ProductCost {
  americano: number;
  latte: number;
  syrupLatte: number;
}

export interface CafeUnitCosts {
  unitCosts: {
    bean: number;
    milk: number;
    water: number;
    ice: number;
    syrup: number;
  };
  finalCostAmericano: number;
  finalCostLatte: number;
  finalCostSyrupLatte: number;
  products: {
    takeout: {
      hot: ProductCost;
      ice: ProductCost;
    };
    store: {
      hot: ProductCost;
      ice: ProductCost;
    };
  };
}
