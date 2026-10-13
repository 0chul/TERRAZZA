import type { CafeSupplies, GlobalConfig } from './types';

export interface PreparationTask {
  id: string;
  title: string;
  category: string;
  nextAction: string;
  steps: { id: string; label: string; complete?: boolean }[];
}

export const PREPARATION_TASKS: PreparationTask[] = [
  { id: 'pos', title: '포스기 설치', category: '결제', nextAction: '업체 요청 서류를 정리해 전달하면 됩니다.', steps: [
    { id: 'pos-documents', label: '업체 요청 서류 확인 및 정리' },
    { id: 'pos-send', label: '서류 업체 전달' },
    { id: 'pos-install', label: '설치 일정 확정 및 결제 테스트' },
  ] },
  { id: 'machine', title: '라마르조꼬 설치', category: '장비', nextAction: '704,000원 견적 확보 · 부가세 포함. 일정과 급수·배수·전원 조건을 확인합니다.', steps: [
    { id: 'machine-quote', label: '설치 견적 확보 · 704,000원 (부가세 포함)', complete: true },
    { id: 'machine-schedule', label: '설치 일정 및 현장 조건 확인' },
    { id: 'machine-install', label: '설치 및 테스트 샷 확인' },
  ] },
  { id: 'sign', title: '간판 설치', category: '외관', nextAction: '주물 간판 구매와 실사 출력을 준비합니다.', steps: [
    { id: 'sign-cast', label: '주물 간판 구매' },
    { id: 'sign-print', label: '실사 출력' },
    { id: 'sign-install', label: '부착 위치·설치 일정 확인 및 설치' },
  ] },
  { id: 'menu', title: '메뉴 구성', category: '메뉴', nextAction: '기본 4종과 잔당 10,000~12,000원 고급 커피 라인업을 준비합니다.', steps: [
    { id: 'menu-basic', label: '에스프레소·아메리카노·라떼·시럽라떼 레시피 및 판매가 확정' },
    { id: 'menu-premium', label: '고급 커피 원두·추출 방식·판매가 확정' },
    { id: 'menu-pos', label: '시음·원가 검토 및 메뉴판·POS 등록' },
  ] },
  { id: 'supplies', title: '카페 일회용품 구매', category: '구매', nextAction: '상세 설정에 연결된 아래 구매 목록에서 규격과 수량을 확인합니다.', steps: [
    { id: 'supplies-spec', label: '컵·뚜껑 호환 규격 및 발주 수량 확정' },
    { id: 'supplies-order', label: '구매 목록 전 품목 구매 확인' },
    { id: 'supplies-receive', label: '입고 검수 및 보관 위치 정리' },
  ] },
  { id: 'manual', title: '운영 매뉴얼 준비', category: '운영', nextAction: '매뉴얼 v0.9를 바탕으로 운영 정책을 확정하고 직원에게 공유합니다.', steps: [
    { id: 'manual-page', label: '운영 매뉴얼 페이지 구성', complete: true },
    { id: 'manual-policy', label: '영업시간·메뉴·대관·취소 정책 확정' },
    { id: 'manual-training', label: '직원 공유 및 오픈·전환·마감 교육' },
  ] },
];

export const SUPPLY_ITEMS: { key: keyof CafeSupplies; name: string; spec: string; usage: 'hotTakeout' | 'iceTakeout' | 'takeout' | 'hot' | 'ice' | 'all' }[] = [
  { key: 'hotCup', name: '핫컵', spec: '13oz · 상세 설정 기준', usage: 'hotTakeout' },
  { key: 'hotLid', name: '핫컵 뚜껑', spec: '핫컵 림 지름에 맞는 규격', usage: 'hotTakeout' },
  { key: 'stick', name: '스틱 / 스터러', spec: 'HOT 음료용', usage: 'hot' },
  { key: 'iceCup', name: '아이스컵', spec: '16oz · 상세 설정 기준', usage: 'iceTakeout' },
  { key: 'iceLid', name: '아이스컵 뚜껑', spec: '아이스컵 림 지름에 맞는 규격', usage: 'iceTakeout' },
  { key: 'straw', name: '빨대', spec: '자바라 · ICE 음료용', usage: 'ice' },
  { key: 'holder', name: '컵 홀더', spec: '13oz / 16oz 호환 확인', usage: 'takeout' },
  { key: 'carrier', name: '캐리어', spec: '2구 · 현재 원가 모델은 포장 음료당 1개', usage: 'takeout' },
  { key: 'wipe', name: '물티슈', spec: '매장·포장 공용', usage: 'all' },
  { key: 'napkin', name: '냅킨', spec: '매장·포장 공용', usage: 'all' },
];

// Quantities use the same HOT/ICE and takeout assumptions as the cost model.
export const calculateSupplyOrder = (config: GlobalConfig, dailySales: number, days: number, safetyRatio: number, stock: Partial<Record<keyof CafeSupplies, number>>) => {
  const total = dailySales * days;
  const ice = config.cafe.iceRatio;
  const takeout = config.cafe.takeoutRatio;
  const factors = { hotTakeout: (1 - ice) * takeout, iceTakeout: ice * takeout, takeout, hot: 1 - ice, ice, all: 1 };
  return SUPPLY_ITEMS.map(item => {
    const expected = Math.ceil(total * factors[item.usage]);
    const safety = Math.ceil(expected * safetyRatio);
    const available = Math.max(0, stock[item.key] ?? 0);
    const quantity = Math.max(0, expected + safety - available);
    return { ...item, expected, safety, stock: available, quantity, unitCost: config.cafeSupplies[item.key], amount: quantity * config.cafeSupplies[item.key] };
  });
};
