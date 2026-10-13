import type { InteriorCost, InteriorDeposit } from './types';

export const FINANCE_SOURCE = '떼라짜_자금표 및 공사내역_20260824.xls';
export const FINANCE_IMPORT_VERSION = '2026-10-13-v1';

export const DEFAULT_INTERIOR_COSTS: InteriorCost[] = [
  {
    "id": "1",
    "date": "2026-01-09",
    "category": "덕트",
    "item": "닥트 인건비, 자재비",
    "cost": 2860000,
    "details": "삼성공조닥트",
    "payment": "세금계산서",
    "source": "지출내역!B3:G3",
    "rawDate": null
  },
  {
    "id": "2",
    "date": "2026-01-31",
    "category": "주방기기",
    "item": "4도어 냉장고",
    "cost": 40000,
    "details": "",
    "payment": "직접구매",
    "source": "지출내역!B4:G4",
    "rawDate": null
  },
  {
    "id": "3",
    "date": "2026-01-31",
    "category": "운임",
    "item": "냉장고 배송",
    "cost": 60000,
    "details": "",
    "payment": "직접구매",
    "source": "지출내역!B5:G5",
    "rawDate": null
  },
  {
    "id": "4",
    "date": "2026-02-06",
    "category": "전기",
    "item": "인건비",
    "cost": 350000,
    "details": "김도희(전기작업)",
    "payment": "계좌이체",
    "source": "지출내역!B6:G6",
    "rawDate": null
  },
  {
    "id": "5",
    "date": "2026-03-02",
    "category": "목공",
    "item": "고재 자재 2차",
    "cost": 690000,
    "details": "프로젝트게러지",
    "payment": "세금계산서",
    "source": "지출내역!B7:G7",
    "rawDate": null
  },
  {
    "id": "6",
    "date": "2026-03-02",
    "category": "목공",
    "item": "목공피스",
    "cost": 18000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B8:G8",
    "rawDate": null
  },
  {
    "id": "7",
    "date": "2026-03-02",
    "category": "목공",
    "item": "타카핀",
    "cost": 27000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B9:G9",
    "rawDate": null
  },
  {
    "id": "8",
    "date": "2026-03-02",
    "category": "목공",
    "item": "목자재 1차",
    "cost": 587400,
    "details": "서울시티목재",
    "payment": "세금계산서",
    "source": "지출내역!B10:G10",
    "rawDate": null
  },
  {
    "id": "9",
    "date": "2026-03-02",
    "category": "목공",
    "item": "고재 자재 1차",
    "cost": 869000,
    "details": "프로젝트게러지",
    "payment": "세금계산서",
    "source": "지출내역!B11:G11",
    "rawDate": null
  },
  {
    "id": "10",
    "date": "2026-03-02",
    "category": "운임",
    "item": "스탠판 자재 운임",
    "cost": 40000,
    "details": "김상문(용달)",
    "payment": "계좌이체",
    "source": "지출내역!B12:G12",
    "rawDate": null
  },
  {
    "id": "11",
    "date": "2026-03-02",
    "category": "기타",
    "item": "보양지 마대",
    "cost": 13000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B13:G13",
    "rawDate": null
  },
  {
    "id": "12",
    "date": "2026-03-02",
    "category": "금속",
    "item": "스탠판",
    "cost": 143000,
    "details": "신민성(서울철강샤링)",
    "payment": "계좌이체",
    "source": "지출내역!B14:G14",
    "rawDate": null
  },
  {
    "id": "13",
    "date": "2026-03-02",
    "category": "목공",
    "item": "인건비 1차",
    "cost": 500000,
    "details": "정한울(목수)",
    "payment": "계좌이체",
    "source": "지출내역!B15:G15",
    "rawDate": null
  },
  {
    "id": "14",
    "date": "2026-03-02",
    "category": "목공",
    "item": "선반 경첩",
    "cost": 43120,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B16:G16",
    "rawDate": null
  },
  {
    "id": "15",
    "date": "2026-03-03",
    "category": "목공",
    "item": "목자재 2차",
    "cost": 665500,
    "details": "서울시티목재",
    "payment": "세금계산서",
    "source": "지출내역!B17:G17",
    "rawDate": null
  },
  {
    "id": "16",
    "date": "2026-03-03",
    "category": "운임",
    "item": "목자재 1차 운임",
    "cost": 40000,
    "details": "",
    "payment": "계좌이체",
    "source": "지출내역!B18:G18",
    "rawDate": null
  },
  {
    "id": "17",
    "date": "2026-03-04",
    "category": "기타",
    "item": "교통비",
    "cost": 10000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B19:G19",
    "rawDate": null
  },
  {
    "id": "18",
    "date": "2026-03-04",
    "category": "기타",
    "item": "교통비",
    "cost": 9600,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B20:G20",
    "rawDate": null
  },
  {
    "id": "19",
    "date": "2026-03-04",
    "category": "기타",
    "item": "교통비",
    "cost": 19900,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B21:G21",
    "rawDate": null
  },
  {
    "id": "20",
    "date": "2026-03-05",
    "category": "운임",
    "item": "고재 운임(반품)",
    "cost": 25000,
    "details": "한홍길(용달)",
    "payment": "계좌이체",
    "source": "지출내역!B22:G22",
    "rawDate": null
  },
  {
    "id": "21",
    "date": "2026-03-06",
    "category": "목공",
    "item": "목자재 3차",
    "cost": 93500,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B23:G23",
    "rawDate": null
  },
  {
    "id": "22",
    "date": "2026-03-07",
    "category": "기타",
    "item": "코팅 장갑",
    "cost": 5000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B24:G24",
    "rawDate": null
  },
  {
    "id": "23",
    "date": "2026-03-07",
    "category": "목공",
    "item": "목공 본드",
    "cost": 4500,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B25:G25",
    "rawDate": null
  },
  {
    "id": "24",
    "date": "2026-03-07",
    "category": "기타",
    "item": "교통비",
    "cost": 10000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B26:G26",
    "rawDate": null
  },
  {
    "id": "25",
    "date": "2026-03-07",
    "category": "목공",
    "item": "인건비 잔금",
    "cost": 2500000,
    "details": "오현석(목수)",
    "payment": "3.3% 제외 입금(250만원)",
    "source": "지출내역!B27:G27",
    "rawDate": null
  },
  {
    "id": "26",
    "date": "2026-03-07",
    "category": "목공",
    "item": "경첩 피스, 다보 피스",
    "cost": 22000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B28:G28",
    "rawDate": null
  },
  {
    "id": "27",
    "date": "2026-03-09",
    "category": "설비",
    "item": "스탠 싱크",
    "cost": 120000,
    "details": "쿠팡구매",
    "payment": "법인카드",
    "source": "지출내역!B29:G29",
    "rawDate": null
  },
  {
    "id": "28",
    "date": "2026-03-13",
    "category": "대리석",
    "item": "대리석 자재비",
    "cost": 1250000,
    "details": "에이스석재",
    "payment": "세금계산서",
    "source": "지출내역!B30:G30",
    "rawDate": null
  },
  {
    "id": "29",
    "date": "2026-03-18",
    "category": "행정",
    "item": "영업신고수수료",
    "cost": 27000,
    "details": "등록면허세납부",
    "payment": "계좌이체",
    "source": "지출내역!B31:G31",
    "rawDate": null
  },
  {
    "id": "30",
    "date": "2026-03-19",
    "category": "운임",
    "item": "대리석 운임",
    "cost": 55000,
    "details": "이형관(한비산업)",
    "payment": "계좌이체",
    "source": "지출내역!B32:G32",
    "rawDate": null
  },
  {
    "id": "31",
    "date": "2026-03-19",
    "category": "운임",
    "item": "목자재 2차 운임",
    "cost": 40000,
    "details": "",
    "payment": "계좌이체",
    "source": "지출내역!B33:G33",
    "rawDate": null
  },
  {
    "id": "32",
    "date": "2026-03-20",
    "category": "설비",
    "item": "감압변 부속 자재",
    "cost": 30000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B34:G34",
    "rawDate": null
  },
  {
    "id": "33",
    "date": "2026-03-20",
    "category": "설비",
    "item": "전기온수기 자재",
    "cost": 137000,
    "details": "김성환",
    "payment": "계좌이체",
    "source": "지출내역!B35:G35",
    "rawDate": null
  },
  {
    "id": "34",
    "date": "2026-03-20",
    "category": "설비",
    "item": "전기온수기 2",
    "cost": 150000,
    "details": "",
    "payment": "직접구매",
    "source": "지출내역!B36:G36",
    "rawDate": null
  },
  {
    "id": "35",
    "date": "2026-03-20",
    "category": "설비",
    "item": "휴지걸이",
    "cost": 139500,
    "details": "",
    "payment": "직접구매",
    "source": "지출내역!B37:G37",
    "rawDate": null
  },
  {
    "id": "36",
    "date": "2026-03-24",
    "category": "설비",
    "item": "인건비",
    "cost": 495000,
    "details": "유성우(굿보이)",
    "payment": "세금계산서",
    "source": "지출내역!B38:G38",
    "rawDate": null
  },
  {
    "id": "37",
    "date": "2026-03-21",
    "category": "설비",
    "item": "설비 자재 2차",
    "cost": 43000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B39:G39",
    "rawDate": null
  },
  {
    "id": "38",
    "date": "2026-03-21",
    "category": "기타",
    "item": "식대",
    "cost": 26000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B40:G40",
    "rawDate": null
  },
  {
    "id": "39",
    "date": "2026-03-21",
    "category": "설비",
    "item": "설비 자재 1차",
    "cost": 382550,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B41:G41",
    "rawDate": null
  },
  {
    "id": "40",
    "date": "2026-03-21",
    "category": "설비",
    "item": "설비 부자재",
    "cost": 15000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B42:G42",
    "rawDate": null
  },
  {
    "id": "41",
    "date": "2026-03-24",
    "category": "전기",
    "item": "라인조명 전원선",
    "cost": 15000,
    "details": "",
    "payment": "법인카드",
    "source": "지출내역!B43:G43",
    "rawDate": null
  },
  {
    "id": "42",
    "date": "2026-03-25",
    "category": "전기",
    "item": "라인조명 자재",
    "cost": 130000,
    "details": "네이버구매",
    "payment": "법인카드",
    "source": "지출내역!B44:G44",
    "rawDate": null
  },
  {
    "id": "43",
    "date": "2026-03-26",
    "category": "데코타일",
    "item": "데코타일",
    "cost": 110380,
    "details": "쿠팡구매",
    "payment": "법인카드",
    "source": "지출내역!B45:G45",
    "rawDate": null
  },
  {
    "id": "44",
    "date": "2026-07-31",
    "category": "전기",
    "item": "인건비",
    "cost": 990000,
    "details": "",
    "payment": "계좌이체",
    "source": "지출내역!B46:G46",
    "rawDate": null
  },
  {
    "id": "45",
    "date": "2026-07-31",
    "category": "전기",
    "item": "간접조명 구매",
    "cost": 18500,
    "details": "",
    "payment": "조영철 카드",
    "source": "지출내역!B47:G47",
    "rawDate": null
  },
  {
    "id": "46",
    "date": "2026-07-31",
    "category": "기타",
    "item": "전기공 식대",
    "cost": 39000,
    "details": "",
    "payment": "조영철 카드",
    "source": "지출내역!B48:G48",
    "rawDate": null
  },
  {
    "id": "47",
    "date": "2026-08-03",
    "category": "도장",
    "item": "인건비",
    "cost": 970000,
    "details": "",
    "payment": "계좌이체",
    "source": "지출내역!B49:G49",
    "rawDate": null
  },
  {
    "id": "48",
    "date": "2026-08-03",
    "category": "기타",
    "item": "도장공 식대",
    "cost": 36000,
    "details": "",
    "payment": "조영철 카드",
    "source": "지출내역!B50:G50",
    "rawDate": null
  },
  {
    "id": "49",
    "date": "2026-08-03",
    "category": "기타",
    "item": "스카이",
    "cost": 440000,
    "details": "",
    "payment": "계좌이체",
    "source": "지출내역!B51:G51",
    "rawDate": null
  },
  {
    "id": "50",
    "date": "2026-08-24",
    "category": "설비",
    "item": "환풍기",
    "cost": 176000,
    "details": "쿠팡구매",
    "payment": "조영철 카드",
    "source": "지출내역!B52:G52",
    "rawDate": null
  },
  {
    "id": "51",
    "date": "2026-09-10",
    "category": "청소",
    "item": "유리, 바닥청소",
    "cost": 36000,
    "details": "",
    "payment": "계좌이체",
    "source": "지출내역!B53:G53",
    "rawDate": null
  },
  {
    "id": "52",
    "date": "2026-09-10",
    "category": "청소",
    "item": "유리, 바닥청소",
    "cost": 100000,
    "details": "",
    "payment": "계좌이체",
    "source": "지출내역!B54:G54",
    "rawDate": null
  },
  {
    "id": "53",
    "date": "",
    "category": "도장",
    "item": "인건비",
    "cost": 180000,
    "details": "추가작업",
    "payment": "계좌이체",
    "source": "지출내역!B55:G55",
    "rawDate": "2026-10-0"
  }
];

// Only untouched historical seed records are replaced during import.
export const LEGACY_INTERIOR_COSTS: InteriorCost[] = [
  {
    "id": "1",
    "date": "2025-01-09",
    "category": "덕트",
    "item": "닥트 인건비, 자재비 (삼성공조닥트)",
    "cost": 2860000
  },
  {
    "id": "2",
    "date": "2025-01-31",
    "category": "주방기기",
    "item": "4도어 냉장고",
    "cost": 40000
  },
  {
    "id": "3",
    "date": "2025-01-31",
    "category": "운임",
    "item": "냉장고 배송",
    "cost": 60000
  },
  {
    "id": "4",
    "date": "2025-02-06",
    "category": "전기",
    "item": "인건비 (김도희)",
    "cost": 350000
  },
  {
    "id": "5",
    "date": "2025-03-02",
    "category": "목공",
    "item": "고재 자재 2차 (프로젝트게러지)",
    "cost": 690000
  },
  {
    "id": "6",
    "date": "2025-03-02",
    "category": "목공",
    "item": "목공피스",
    "cost": 18000
  },
  {
    "id": "7",
    "date": "2025-03-02",
    "category": "목공",
    "item": "타카핀",
    "cost": 27000
  },
  {
    "id": "8",
    "date": "2025-03-02",
    "category": "목공",
    "item": "목자재 1차 (서울시티목재)",
    "cost": 587400
  },
  {
    "id": "9",
    "date": "2025-03-02",
    "category": "목공",
    "item": "고재 자재 1차 (프로젝트게러지)",
    "cost": 869000
  },
  {
    "id": "10",
    "date": "2025-03-02",
    "category": "운임",
    "item": "스탠판 자재 운임 (김상문)",
    "cost": 40000
  },
  {
    "id": "11",
    "date": "2025-03-02",
    "category": "기타",
    "item": "보양지 마대",
    "cost": 13000
  },
  {
    "id": "12",
    "date": "2025-03-02",
    "category": "금속",
    "item": "스탠판 (신민성)",
    "cost": 143000
  },
  {
    "id": "13",
    "date": "2025-03-02",
    "category": "목공",
    "item": "인건비 1차 (정한울)",
    "cost": 500000
  },
  {
    "id": "14",
    "date": "2025-03-02",
    "category": "목공",
    "item": "선반 경첩",
    "cost": 43120
  },
  {
    "id": "15",
    "date": "2025-03-03",
    "category": "목공",
    "item": "목자재 2차 (서울시티목재)",
    "cost": 665500
  },
  {
    "id": "16",
    "date": "2025-03-03",
    "category": "운임",
    "item": "목자재 1차 운임",
    "cost": 40000
  },
  {
    "id": "17",
    "date": "2025-03-04",
    "category": "기타",
    "item": "교통비",
    "cost": 10000
  },
  {
    "id": "18",
    "date": "2025-03-04",
    "category": "기타",
    "item": "교통비",
    "cost": 9600
  },
  {
    "id": "19",
    "date": "2025-03-04",
    "category": "기타",
    "item": "교통비",
    "cost": 19900
  },
  {
    "id": "20",
    "date": "2025-03-05",
    "category": "운임",
    "item": "고재 운임반품 (한홍길)",
    "cost": 25000
  },
  {
    "id": "21",
    "date": "2025-03-06",
    "category": "목공",
    "item": "목자재 3차",
    "cost": 93500
  },
  {
    "id": "22",
    "date": "2025-03-07",
    "category": "기타",
    "item": "코팅 장갑",
    "cost": 5000
  },
  {
    "id": "23",
    "date": "2025-03-07",
    "category": "목공",
    "item": "목공 본드",
    "cost": 4500
  },
  {
    "id": "24",
    "date": "2025-03-07",
    "category": "기타",
    "item": "교통비",
    "cost": 10000
  },
  {
    "id": "25",
    "date": "2025-03-07",
    "category": "목공",
    "item": "인건비 잔금 (오현석)",
    "cost": 2500000
  },
  {
    "id": "26",
    "date": "2025-03-07",
    "category": "목공",
    "item": "경첩 피스, 다보 피스",
    "cost": 22000
  },
  {
    "id": "27",
    "date": "2025-03-09",
    "category": "설비",
    "item": "스텐 싱크 (쿠팡구매)",
    "cost": 120000
  },
  {
    "id": "28",
    "date": "2025-03-13",
    "category": "대리석",
    "item": "대리석 자재비 (에이스석재)",
    "cost": 1250000
  },
  {
    "id": "29",
    "date": "2025-03-18",
    "category": "행정",
    "item": "영업신고수수료 (등록면허세납부)",
    "cost": 27000
  },
  {
    "id": "30",
    "date": "2025-03-19",
    "category": "운임",
    "item": "대리석 운임 (이형관)",
    "cost": 55000
  },
  {
    "id": "31",
    "date": "2025-03-19",
    "category": "운임",
    "item": "목자재 2차 운임",
    "cost": 40000
  },
  {
    "id": "32",
    "date": "2025-03-20",
    "category": "설비",
    "item": "감압변 부속 자재",
    "cost": 30000
  },
  {
    "id": "33",
    "date": "2025-03-20",
    "category": "설비",
    "item": "전기온수기 자재 (김성환)",
    "cost": 137000
  },
  {
    "id": "34",
    "date": "2025-03-20",
    "category": "설비",
    "item": "전기온수기 2",
    "cost": 150000
  },
  {
    "id": "35",
    "date": "2025-03-20",
    "category": "설비",
    "item": "휴지걸이",
    "cost": 139500
  },
  {
    "id": "36",
    "date": "2025-03-24",
    "category": "설비",
    "item": "인건비 (유성우)",
    "cost": 495000
  },
  {
    "id": "37",
    "date": "2025-03-21",
    "category": "설비",
    "item": "설비 자재 2차",
    "cost": 43000
  },
  {
    "id": "38",
    "date": "2025-03-21",
    "category": "기타",
    "item": "식대",
    "cost": 26000
  },
  {
    "id": "39",
    "date": "2025-03-21",
    "category": "설비",
    "item": "설비 자재 1차",
    "cost": 382550
  },
  {
    "id": "40",
    "date": "2025-03-21",
    "category": "설비",
    "item": "설비 부자재",
    "cost": 15000
  },
  {
    "id": "41",
    "date": "2025-03-24",
    "category": "전기",
    "item": "라인조명 전원선",
    "cost": 15000
  },
  {
    "id": "42",
    "date": "2025-03-25",
    "category": "전기",
    "item": "라인조명 자재 (네이버구매)",
    "cost": 130000
  },
  {
    "id": "43",
    "date": "2025-03-26",
    "category": "데코타일",
    "item": "데코타일 (쿠팡구매)",
    "cost": 110380
  }
];

export const DEFAULT_INTERIOR_DEPOSITS: InteriorDeposit[] = [
  {
    "id": "xls-deposit-jan",
    "date": "2026-01-09",
    "note": "테라짜 입금",
    "amount": 2860000,
    "source": "입금내역!E14"
  },
  {
    "id": "xls-deposit-feb",
    "date": "2026-02-27",
    "note": "목공 공사비 선금",
    "amount": 3000000,
    "source": "입금내역!E6"
  },
  {
    "id": "xls-deposit-mar5",
    "date": "2026-03-05",
    "note": "가수금 입금",
    "amount": 1000000,
    "source": "입금내역!E9"
  },
  {
    "id": "xls-deposit-mar7",
    "date": "2026-03-07",
    "note": "가수금 입금",
    "amount": 3000000,
    "source": "입금내역!E8"
  },
  {
    "id": "xls-deposit-mar13",
    "date": "2026-03-13",
    "note": "가수금 입금",
    "amount": 1250000,
    "source": "입금내역!E7"
  },
  {
    "id": "xls-deposit-mar24",
    "date": "2026-03-24",
    "note": "인테리어 공사비 입금",
    "amount": 2000000,
    "source": "입금내역!E5"
  },
  {
    "id": "confirmed-deposit-extra",
    "date": "",
    "note": "추가 입금 · 입금일 확인 필요",
    "amount": 3000000,
    "source": "지출내역!J17 / 사용자 확인(2026-10-13)"
  }
];

export const DEFAULT_INTERIOR_TOTAL = DEFAULT_INTERIOR_COSTS.reduce((sum, row) => sum + row.cost, 0);
