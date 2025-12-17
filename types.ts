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
  rent: number;
  labor: number;
  utilities: number;
  internet: number;
  marketing: number;
  maintenance: number;
  misc: number;
}

export interface InitialInvestment {
  deposit: number;
  interior: number;
  equipment: number;
  design: number;
  supplies: number;
}

export interface MonthlyData {
  month: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  fixedCosts: number;
  netProfit: number;
  cumulativeProfit: number;
}

export interface GlobalConfig {
  cafe: CafeConfig;
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