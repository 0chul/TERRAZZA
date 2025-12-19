
import { GlobalConfig, TodoItem, CafeSupplies } from './types';

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
    seatCount: 60, // Increased for Cafe Focus
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
    hourlyRate: 40000,
    hoursPerDay: 8,
    operatingDays: 30,
    utilizationRate: 0.2, // Lower utilization for space
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
    interior: 60000000,
    equipment: 20000000,
    design: 3000000,
    supplies: 5000000,
  },
};

export const INITIAL_TODOS: TodoItem[] = [
  // 영업 신고 관련 서류
  { id: 'doc-1', category: '영업 신고', task: '영업 신고', note: '관할 구청 위생과', completed: false },
  { id: 'doc-2', category: '영업 신고', task: '위생 교육 필증', note: '한국외식업중앙회 온라인 수료', completed: false },
  { id: 'doc-3', category: '영업 신고', task: '위생관리책임자 지정 확인서', note: '', completed: false },
  { id: 'doc-4', category: '영업 신고', task: '등기부등본', note: '건물/토지', completed: false },
  { id: 'doc-5', category: '영업 신고', task: '보건증', note: '보건소 (발급 1주 소요)', completed: false },
  { id: 'doc-6', category: '영업 신고', task: '보험가입증권', note: '재난배상책임보험', completed: false },
  { id: 'doc-7', category: '영업 신고', task: '인감 도장', note: '대표자 본인', completed: false },
  { id: 'doc-8', category: '영업 신고', task: '인감 증명서', note: '주민센터 발급', completed: false },
  { id: 'doc-9', category: '영업 신고', task: '위임장', note: '대리인 방문 시 필요', completed: false },
  { id: 'doc-10', category: '영업 신고', task: '대리인 신분증', note: '대리인 방문 시 필요', completed: false },
  { id: 'doc-11', category: '영업 신고', task: '사업자등록증', note: '세무서 (영업신고증 지참 후 방문)', completed: false },
  
  // 기타 필수 항목
  { id: 'fin-1', category: '금융', task: '통장 개설', note: '사업자용', completed: false },
  { id: 'fin-2', category: '금융', task: '카드 가맹 신청', note: 'POS 업체 대행', completed: false },
  { id: 'fac-1', category: '시설', task: '인테리어 공사', note: '3주 소요 예정', completed: false },
  { id: 'fac-2', category: '시설', task: '인터넷/CCTV 설치', note: '', completed: false },
  { id: 'fac-3', category: '시설', task: '전기 승압 확인', note: '계약전력 확인', completed: false },
  { id: 'hr-1', category: '인력', task: '알바 채용 공고', note: '알바천국/알바몬', completed: false },
  { id: 'hr-2', category: '인력', task: '근로계약서 작성', note: '', completed: false },
  { id: 'op-1', category: '운영', task: '메뉴판 디자인', note: '', completed: false },
  { id: 'op-2', category: '운영', task: '초도 물품 발주', note: '원두, 우유, 컵 등', completed: false },
  { id: 'op-3', category: '운영', task: '네이버 지도 등록', note: '스마트플레이스', completed: false },
];
