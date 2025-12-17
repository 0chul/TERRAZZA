import { GlobalConfig, TodoItem } from './types';

// Based on the provided Excel images
export const CAFE_UNIT_COSTS = {
  // Consumables (Won)
  HOT_CUP: 39,
  HOT_LID: 25,
  STICK: 5,
  ICE_CUP: 52,
  ICE_LID: 26,
  STRAW: 6,
  HOLDER: 19,
  CARRIER: 18, // 0.3 probability applied in logic if needed, or avg
  WIPE: 18,
  NAPKIN: 4,
  DISHWASHING: 60, // Labor/Resource proxy for store
  
  // Ingredients (Volume/Weight base is dynamic, these are fixed add-ons)
  WATER: 30,
  ICE: 50,
  SYRUP: 150, // Updated: Assumes decent quality syrup cost per serving (~30ml)
  
  // Specs
  BEAN_GRAMS: 20,
  MILK_ML: 150,
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
  space: {
    hourlyRate: 50000,
    hoursPerDay: 8,
    operatingDays: 20,
    utilizationRate: 0.5,
  },
  wine: {
    avgTicketPrice: 65000,
    costOfGoodsSoldRate: 0.35,
    dailyTables: 5,
    operatingDays: 24,
  },
  fixed: {
    rent: 2500000,
    labor: 5800000, 
    utilities: 500000,
    internet: 40000,
    marketing: 1000000,
    maintenance: 200000,
    misc: 300000,
  },
  initial: {
    deposit: 50000000,
    interior: 50000000,
    equipment: 15000000,
    design: 2000000,
    supplies: 5000000,
  },
};

export const INITIAL_TODOS: TodoItem[] = [
  { id: '1', category: '행정', task: '위생 교육 필증', note: '위생관리책임자 선임', completed: true },
  { id: '2', category: '행정', task: '보건증', note: '전 직원 필수', completed: true },
  { id: '3', category: '행정', task: '임대차 계약서', note: '확정일자 받기', completed: true },
  { id: '4', category: '행정', task: '영업 신고', note: '관할 구청 위생과', completed: false },
  { id: '5', category: '행정', task: '사업자 등록증', note: '세무서 방문', completed: false },
  { id: '6', category: '금융', task: '통장 개설', note: '사업자용', completed: false },
  { id: '7', category: '금융', task: '카드 가맹 신청', note: '단말기 업체 대행', completed: false },
  { id: '8', category: '시설', task: '인테리어 공사', note: '3주 소요 예정', completed: false },
  { id: '9', category: '시설', task: '인터넷/CCTV 설치', note: '', completed: false },
  { id: '10', category: '시설', task: '전기 승압 확인', note: '계약전력 확인', completed: false },
  { id: '11', category: '인력', task: '알바 채용 공고', note: '알바천국/알바몬', completed: false },
  { id: '12', category: '인력', task: '근로계약서 작성', note: '', completed: false },
  { id: '13', category: '운영', task: '메뉴판 디자인', note: '', completed: false },
  { id: '14', category: '운영', task: '초도 물품 발주', note: '원두, 우유, 컵 등', completed: false },
  { id: '15', category: '운영', task: '네이버 지도 등록', note: '스마트플레이스', completed: false },
];