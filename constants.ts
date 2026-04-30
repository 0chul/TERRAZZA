
import { GlobalConfig, CafeSupplies } from './types';

export const DEFAULT_CAFE_SUPPLIES: CafeSupplies = {
  hotCup: 39,
  hotLid: 25,
  stick: 5,
  iceCup: 52,
  iceLid: 26,
  straw: 6,
  holder: 19,
  carrier: 60,
  wipe: 18,
  napkin: 4,
  dishwashing: 60,
  water: 30,
  ice: 50,
  syrup: 60,
  beanGrams: 20,
  milkMl: 150,
};

// Default Config updated to "Cafe Focused" model
export const DEFAULT_CONFIG: GlobalConfig = {
  cafe: {
    avgPriceAmericano: 4500,
    avgPriceLatte: 5000,
    avgPriceSyrupLatte: 5500,
    beanPricePerKg: 30000, 
    milkPricePerL: 2500,
    seatCount: 30, // Updated for Cafe Focus
    operatingHours: 9,
    stayDuration: 2,
    turnoverTarget: 1.2, // High turnover for Cafe Focus
    ratioAmericano: 0.5,
    ratioLatte: 0.3,
    ratioSyrupLatte: 0.2,
    takeoutRatio: 0.6,
    iceRatio: 0.7,
    operatingDays: 26,
  },
  cafeSupplies: DEFAULT_CAFE_SUPPLIES,
  space: {
    partSAvgPrice: 250000,
    partSCountPerMonth: 8,
    partMAvgPrice: 550000,
    partMCountPerMonth: 4,
    fullHalfAvgPrice: 850000,
    fullHalfCountPerMonth: 2,
    fullFullAvgPrice: 1400000,
    fullFullCountPerMonth: 1,
    exhibitionAvgPrice: 2500000,
    exhibitionCountPerMonth: 0,
  },
  wine: {
    avgTicketPrice: 70000,
    costOfGoodsSoldRate: 0.35,
    dailyTables: 2, // Lower volume for wine
    operatingDays: 24,
  },
  fixed: {
    weekdayStaff: 3, // Increased staff for cafe volume
    weekendStaff: 1,
    additionalLabor: 0,
    utilities: 1500000,
    internet: 40000,
    marketing: 1000000,
    maintenance: 100000,
    misc: 100000,
  },
  initial: {
    interior: 12810950,
    equipment: 20000000,
    design: 3000000,
    supplies: 5000000,
  },
};
