
export interface CafeConfig {
  avgPriceAmericano: number;
  avgPriceLatte: number;
  avgPriceSyrupLatte: number;
  beanPricePerKg: number; 
  milkPricePerL: number; 
  seatCount: number;      
  operatingHours: number; 
  stayDuration: number;   
  turnoverTarget: number; 
  ratioAmericano: number; 
  ratioLatte: number;     
  ratioSyrupLatte: number; 
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
}

export interface FixedCosts {
  weekdayStaff: number;
  weekendStaff: number;
  additionalLabor: number;
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
  cafeRevenue: number;
  spaceRevenue: number;
  wineRevenue: number;
  cafeCOGS: number;
  wineCOGS: number;
  laborCost: number;
  utilityCost: number;
  otherFixedCost: number;
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

export interface Scenario {
  id: string;
  name: string;
  config: GlobalConfig;
  timestamp: number;
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

export interface BusinessReport {
  content: string;
  timestamp: string;
}
