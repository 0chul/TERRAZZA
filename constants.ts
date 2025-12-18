
import { GlobalConfig, TodoItem, CafeSupplies } from './types';

// Based on the provided Excel images, now editable
export const DEFAULT_CAFE_SUPPLIES: CafeSupplies = {
  // Consumables (Won)
  hotCup: 39,
  hotLid: 25,
  stick: 5,
  iceCup: 52,
  iceLid: 26,
  straw: 6,
  holder: 19,
  carrier: 60, // Updated based on screenshot
  wipe: 18,
  napkin: 4,
  dishwashing: 60, // Labor/Resource proxy for store
  
  // Ingredients (Volume/Weight base is dynamic, these are fixed add-ons)
  water: 30,
  ice: 50,
  syrup: 60, // Updated based on screenshot
  
  // Specs
  beanGrams: 20,
  milkMl: 150,
};

export const DEFAULT_CONFIG: GlobalConfig = {
  cafe: {
    avgPriceAmericano: 4500,
    avgPriceLatte: 5000,
    avgPriceSyrupLatte: 5500, // Slightly higher than Latte
    beanPricePerKg: 30000, 
    milkPricePerL: 2500,
    
    // New Capacity Settings
    seatCount: 60,
    operatingHours: 9,    // 10am - 7pm
    stayDuration: 2,      // 2 hours
    turnoverTarget: 0.5,  // 50%
    
    ratioAmericano: 0.5,   // 50%
    ratioLatte: 0.3,       // 30%
    ratioSyrupLatte: 0.2,  // 20%
    takeoutRatio: 0.7,     
    iceRatio: 0.75,        
    operatingDays: 26,
  },
  cafeSupplies: DEFAULT_CAFE_SUPPLIES,
  space: {
    hourlyRate: 50000,
    hoursPerDay: 8,
    operatingDays: 30, // Updated from 20 to 30
    utilizationRate: 0.5,
  },
  wine: {
    avgTicketPrice: 65000,
    costOfGoodsSoldRate: 0.35,
    dailyTables: 5,
    operatingDays: 24,
  },
  fixed: {
    weekdayStaff: 2, // 2 full-time staff
    weekendStaff: 1, // 1 weekend staff
    additionalLabor: 0,
    utilities: 2000000,
    internet: 40000,
    marketing: 1000000,
    maintenance: 100000,
    misc: 100000,
  },
  initial: {
    interior: 50000000,
    equipment: 15000000,
    design: 2000000,
    supplies: 5000000,
  },
};

export const INITIAL_TODOS: TodoItem[] = [
  { id: '1', category: '행정', task: '위생 교육 필증', note: '위생관리책임자 선임', completed: true },
  { id: '2', category: '행정', task: '보건증', note: '전 직원 필수', completed: true },
  { id: '3', category: '행정', task: '사업자 등록증', note: '세무서 방문', completed: false },
  { id: '4', category: '행정', task: '영업 신고', note: '관할 구청 위생과', completed: false },
  { id: '5', category: '금융', task: '통장 개설', note: '사업자용', completed: false },
  { id: '6', category: '금융', task: '카드 가맹 신청', note: '단말기 업체 대행', completed: false },
  { id: '7', category: '시설', task: '인테리어 공사', note: '3주 소요 예정', completed: false },
  { id: '8', category: '시설', task: '인터넷/CCTV 설치', note: '', completed: false },
  { id: '9', category: '시설', task: '전기 승압 확인', note: '계약전력 확인', completed: false },
  { id: '10', category: '인력', task: '알바 채용 공고', note: '알바천국/알바몬', completed: false },
  { id: '11', category: '인력', task: '근로계약서 작성', note: '', completed: false },
  { id: '12', category: '운영', task: '메뉴판 디자인', note: '', completed: false },
  { id: '13', category: '운영', task: '초도 물품 발주', note: '원두, 우유, 컵 등', completed: false },
  { id: '14', category: '운영', task: '네이버 지도 등록', note: '스마트플레이스', completed: false },
];
