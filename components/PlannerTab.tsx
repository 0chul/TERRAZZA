
import React, { useState } from 'react';
import {
  Coffee,
  Users,
  TrendingUp,
  DollarSign,
  Calculator,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Briefcase
} from 'lucide-react';
import { GlobalConfig, MonthlyData, CafeSupplies, CafeUnitCosts } from '../types';
import { InputSection } from './InputSection';
import { NumberInput, SliderInput } from './Inputs';

interface PlannerTabProps {
  config: GlobalConfig;
  onConfigChange: (section: keyof GlobalConfig, field: string, value: number) => void;
  onSupplyChange: (field: keyof CafeSupplies, value: number) => void;
  monthlyData: MonthlyData[];
  dailySalesCount: number;
  cafeUnitCosts: CafeUnitCosts;
  totalInvestment: number;
  calculatedLaborCost: number;
}

const WEEKDAY_RATE = 2156880;
const WEEKEND_RATE = 861200;

export const PlannerTab: React.FC<PlannerTabProps> = ({
  config,
  onConfigChange,
  onSupplyChange,
  monthlyData,
  dailySalesCount,
  cafeUnitCosts,
  totalInvestment,
  calculatedLaborCost
}) => {
  const [cafeDetailsOpen, setCafeDetailsOpen] = useState(true);
  const [expandedCostRows, setExpandedCostRows] = useState<Set<string>>(new Set());

  const toggleCostRow = (key: string) => {
    const newSet = new Set(expandedCostRows);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExpandedCostRows(newSet);
  }

  // Fix: Explicitly type CostDetailItem as React.FC to allow magic React props like 'key' in mapping
  const CostDetailItem: React.FC<{ label: string, value: number }> = ({ label, value }) => (
    <div className="flex justify-between text-xs text-gray-600 mb-1">
      <span>{label}</span>
      <span>{Math.round(value)}원</span>
    </div>
  );

  const CostDetailCard = ({ title, items, total }: { title: string, items: {label: string, value: number}[], total: number }) => (
    <div className="bg-white p-3 rounded border border-gray-200 shadow-sm h-full">
      <div className="text-xs font-bold text-gray-800 mb-2 border-b pb-1">{title}</div>
      <div className="space-y-1 mb-2">
        {items.map((item, idx) => (
          <CostDetailItem key={idx} label={item.label} value={item.value} />
        ))}
      </div>
      <div className="border-t pt-1 flex justify-between font-bold text-xs text-blue-700">
        <span>합계</span>
        <span>{Math.round(total).toLocaleString()}원</span>
      </div>
    </div>
  );

  const renderCostDetails = (menu: 'americano' | 'latte' | 'syrupLatte') => {
      const uc = cafeUnitCosts.unitCosts;
      const s = config.cafeSupplies;
      
      const commonTakeoutHot = [
          { label: 'Hot 컵', value: s.hotCup },
          { label: '뚜껑', value: s.hotLid },
          { label: '홀더', value: s.holder },
          { label: '캐리어', value: s.carrier },
          { label: '스틱/냅킨', value: s.stick + s.napkin + s.wipe },
      ];
      const commonTakeoutIce = [
          { label: 'Ice 컵', value: s.iceCup },
          { label: '뚜껑', value: s.iceLid },
          { label: '홀더', value: s.holder },
          { label: '캐리어', value: s.carrier },
          { label: '빨대/냅킨', value: s.straw + s.napkin + s.wipe },
      ];
      const commonStore = [
          { label: '세척/관리', value: s.dishwashing },
          { label: '물티슈/냅킨', value: s.wipe + s.napkin },
      ];

      let ingredientsBase: {label: string, value: number}[] = [];
      if (menu === 'americano') ingredientsBase = [{ label: '원두', value: uc.bean }, { label: '정수물', value: uc.water }];
      if (menu === 'latte') ingredientsBase = [{ label: '원두', value: uc.bean }, { label: '우유', value: uc.milk }];
      if (menu === 'syrupLatte') ingredientsBase = [{ label: '원두', value: uc.bean }, { label: '우유', value: uc.milk }, { label: '시럽', value: uc.syrup }];

      const getItems = (type: 'takeoutHot' | 'takeoutIce' | 'storeHot' | 'storeIce') => {
          let items = [...ingredientsBase];
          if (type === 'takeoutHot') items = [...items, ...commonTakeoutHot];
          if (type === 'takeoutIce') items = [...items, { label: '얼음', value: uc.ice }, ...commonTakeoutIce];
          if (type === 'storeHot') items = [...items, {label: '스틱', value: s.stick}, ...commonStore];
          if (type === 'storeIce') items = [...items, { label: '얼음', value: uc.ice }, {label: '빨대', value: s.straw}, ...commonStore];
          return items;
      };

      return (
          <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 border-t border-gray-200">
               <CostDetailCard title="Takeout (Hot)" items={getItems('takeoutHot')} total={cafeUnitCosts.products.takeout.hot[menu]} />
               <CostDetailCard title="Takeout (Ice)" items={getItems('takeoutIce')} total={cafeUnitCosts.products.takeout.ice[menu]} />
               <CostDetailCard title="매장 (Hot)" items={getItems('storeHot')} total={cafeUnitCosts.products.store.hot[menu]} />
               <CostDetailCard title="매장 (Ice)" items={getItems('storeIce')} total={cafeUnitCosts.products.store.ice[menu]} />
          </div>
      );
  };

  const renderCafeDetailPlanner = () => {
    const totalRatio = config.cafe.ratioAmericano + config.cafe.ratioLatte + config.cafe.ratioSyrupLatte;
    const isRatioValid = Math.abs(totalRatio - 1.0) < 0.01;
    const maxCapacity = Math.round(config.cafe.seatCount * (config.cafe.operatingHours / (config.cafe.stayDuration || 1)));

    const currentCafeRevenue = monthlyData[0]?.cafeRevenue || 0;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <button
          onClick={() => setCafeDetailsOpen(!cafeDetailsOpen)}
          className="w-full px-6 py-4 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors border-l-4 border-amber-500"
        >
          <div className="flex items-center gap-3">
             <Coffee className="text-amber-700" size={24}/>
             <div className="text-left">
                <span className="block font-bold text-lg text-gray-800">카페 (Cafe) 상세 설정</span>
                <span className="text-xs text-gray-500">테이크아웃/매장/HOT/ICE 및 좌석 회전율 기반 매출 예측</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <span className="text-sm text-blue-600 font-bold">
                    월 예상 매출: ₩{Math.round(currentCafeRevenue).toLocaleString()}
                </span>
             </div>
             {cafeDetailsOpen ? <ChevronDown size={24} className="text-amber-700" /> : <ChevronRight size={24} className="text-gray-400" />}
          </div>
        </button>
        
        {cafeDetailsOpen && (
          <div className="p-6 border-t border-gray-200 space-y-8">
            {/* 1. Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Column 1: Capacity & Turnover (New) */}
               <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                    <Users size={16}/> 매출/회전율 예측
                  </h4>
                  
                  <div className="bg-white p-3 rounded border border-indigo-100 shadow-sm mb-4">
                     <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>일 최대 회전 좌석</span>
                        <span className="font-bold">{maxCapacity}석</span>
                     </div>
                     <div className="flex justify-between text-lg text-indigo-700 font-bold items-center border-t border-indigo-50 pt-1 mt-1">
                        <span>일일 판매량</span>
                        <span>{dailySalesCount} 잔/팀</span>
                     </div>
                  </div>

                  <NumberInput label="총 좌석 수" value={config.cafe.seatCount} onChange={(v) => onConfigChange('cafe', 'seatCount', v)} unit="석" />
                  <NumberInput label="일 영업 시간" value={config.cafe.operatingHours} onChange={(v) => onConfigChange('cafe', 'operatingHours', v)} unit="시간" />
                  <NumberInput label="고객 평균 점유시간" value={config.cafe.stayDuration} onChange={(v) => onConfigChange('cafe', 'stayDuration', v)} unit="시간" step={0.5} />
                  
                  <div className="mt-4 pt-4 border-t border-indigo-200">
                     <SliderInput 
                        label="좌석 회전율 (목표)" 
                        value={config.cafe.turnoverTarget} 
                        onChange={(v) => onConfigChange('cafe', 'turnoverTarget', v)} 
                        step={0.05} 
                        max={2.0} // Allow up to 200% turnover
                     />
                  </div>
               </div>

               {/* Column 2: Ratios */}
               <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <TrendingUp size={16}/> 판매 비중 설정
                  </h4>
                  <div className={`p-2 rounded border mb-4 ${isRatioValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                     <div className="text-xs text-gray-500 mb-1">메뉴 비중 합계 (1.0 맞춰주세요)</div>
                     <div className={`text-lg font-bold ${isRatioValid ? 'text-green-700' : 'text-red-600'}`}>
                        {(totalRatio).toFixed(2)} / 1.00
                     </div>
                  </div>
                  
                  <SliderInput label="아메리카노 비중" value={config.cafe.ratioAmericano} onChange={(v) => onConfigChange('cafe', 'ratioAmericano', v)} step={0.05} />
                  <SliderInput label="카페라떼 비중" value={config.cafe.ratioLatte} onChange={(v) => onConfigChange('cafe', 'ratioLatte', v)} step={0.05} />
                  <SliderInput label="시럽라떼 비중" value={config.cafe.ratioSyrupLatte} onChange={(v) => onConfigChange('cafe', 'ratioSyrupLatte', v)} step={0.05} />
                  
                  <div className="my-4 border-t border-gray-200"></div>
                  
                  <SliderInput label="테이크아웃 비율" value={config.cafe.takeoutRatio} onChange={(v) => onConfigChange('cafe', 'takeoutRatio', v)} step={0.05} />
                  <SliderInput label="아이스 음료 비율" value={config.cafe.iceRatio} onChange={(v) => onConfigChange('cafe', 'iceRatio', v)} step={0.05} />
               </div>

               {/* Column 3: Costs & Prices */}
               <div className="space-y-6">
                  {/* Prices */}
                   <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <DollarSign size={16}/> 판매가 설정
                      </h4>
                      <NumberInput label="아메리카노" value={config.cafe.avgPriceAmericano} onChange={(v) => onConfigChange('cafe', 'avgPriceAmericano', v)} unit="원" />
                      <NumberInput label="카페라떼" value={config.cafe.avgPriceLatte} onChange={(v) => onConfigChange('cafe', 'avgPriceLatte', v)} unit="원" />
                      <NumberInput label="시럽라떼" value={config.cafe.avgPriceSyrupLatte} onChange={(v) => onConfigChange('cafe', 'avgPriceSyrupLatte', v)} unit="원" />
                   </div>

                   {/* Materials */}
                   <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calculator size={16}/> 재료비 설정
                      </h4>
                      <NumberInput label="원두 가격 (1kg)" value={config.cafe.beanPricePerKg} onChange={(v) => onConfigChange('cafe', 'beanPricePerKg', v)} unit="원" />
                      <NumberInput label="우유 가격 (1L)" value={config.cafe.milkPricePerL} onChange={(v) => onConfigChange('cafe', 'milkPricePerL', v)} unit="원" />
                      <div className="pt-2 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                            <span>원두 1잔({config.cafeSupplies.beanGrams}g)</span>
                            <span className="font-bold">{Math.round(cafeUnitCosts.unitCosts.bean)}원</span>
                        </div>
                        <div className="flex justify-between">
                            <span>우유 1잔({config.cafeSupplies.milkMl}ml)</span>
                            <span className="font-bold">{Math.round(cafeUnitCosts.unitCosts.milk)}원</span>
                        </div>
                         <div className="flex justify-between">
                            <span>시럽 1회(30ml)</span>
                            <span className="font-bold text-amber-600">+{Math.round(cafeUnitCosts.unitCosts.syrup)}원</span>
                        </div>
                      </div>
                   </div>
               </div>
            </div>

            {/* 2. Detailed Cost Breakdown Matrix */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide flex justify-between items-end">
                  <span>상황별 1잔 원가 분석표 (Cost Matrix)</span>
                  <span className="text-xs normal-case text-gray-500 font-normal">비중: Takeout {config.cafe.takeoutRatio*100}% | Ice {config.cafe.iceRatio*100}%</span>
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left w-32 font-bold">구분</th>
                            <th className="px-4 py-3 bg-blue-50 text-blue-900">Takeout (Hot)</th>
                            <th className="px-4 py-3 bg-blue-100 text-blue-900">Takeout (Ice)</th>
                            <th className="px-4 py-3 bg-green-50 text-green-900">매장 (Hot)</th>
                            <th className="px-4 py-3 bg-green-100 text-green-900">매장 (Ice)</th>
                            <th className="px-4 py-3 bg-gray-800 text-white font-bold">최종 가중평균</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Americano Row */}
                        <tr onClick={() => toggleCostRow('americano')} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                            <td className="px-4 py-3 text-left font-semibold text-gray-800 flex items-center gap-2">
                                {expandedCostRows.has('americano') ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600"/>}
                                아메리카노
                            </td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.hot.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.ice.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.hot.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.ice.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 font-bold bg-amber-50 text-amber-900 border-l border-amber-100">
                                {Math.round(cafeUnitCosts.finalCostAmericano).toLocaleString()}원
                            </td>
                        </tr>
                        {expandedCostRows.has('americano') && (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <div className="pl-32">
                                         {renderCostDetails('americano')}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Latte Row */}
                        <tr onClick={() => toggleCostRow('latte')} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                            <td className="px-4 py-3 text-left font-semibold text-gray-800 flex items-center gap-2">
                                {expandedCostRows.has('latte') ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600"/>}
                                카페라떼
                            </td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.hot.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.ice.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.hot.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.ice.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 font-bold bg-amber-50 text-amber-900 border-l border-amber-100">
                                {Math.round(cafeUnitCosts.finalCostLatte).toLocaleString()}원
                            </td>
                        </tr>
                        {expandedCostRows.has('latte') && (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <div className="pl-32">
                                         {renderCostDetails('latte')}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Syrup Latte Row */}
                        <tr onClick={() => toggleCostRow('syrupLatte')} className="hover:bg-gray-50 cursor-pointer transition-colors group bg-amber-50/30">
                            <td className="px-4 py-3 text-left font-semibold text-gray-800 flex items-center gap-2">
                                {expandedCostRows.has('syrupLatte') ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600"/>}
                                시럽 라떼
                            </td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.hot.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.takeout.ice.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.hot.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-gray-600">{Math.round(cafeUnitCosts.products.store.ice.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 font-bold bg-amber-50 text-amber-900 border-l border-amber-100">
                                {Math.round(cafeUnitCosts.finalCostSyrupLatte).toLocaleString()}원
                            </td>
                        </tr>
                         {expandedCostRows.has('syrupLatte') && (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <div className="pl-32">
                                         {renderCostDetails('syrupLatte')}
                                    </div>
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                * 메뉴명을 클릭하면 상세 재료비 및 포장재 원가를 확인할 수 있습니다.<br/>
                * Takeout: 컵/뚜껑/홀더/캐리어/물티슈 포함 (Ice는 빨대 포함, Hot은 스틱 포함)<br/>
                * 매장: 설거지비용(수도/인건)/물티슈 포함 (일회용컵 제외)
              </p>
            </div>

            {/* 3. Advanced Supply Costs (Closed by default) */}
            <div className="mt-6">
                <InputSection title="🛠 상세 재료/비품 단가 설정 (Advanced Settings)" isOpenDefault={false}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <NumberInput label="핫컵 (13oz)" value={config.cafeSupplies.hotCup} onChange={(v) => onSupplyChange('hotCup', v)} unit="원" />
                        <NumberInput label="핫컵 뚜껑" value={config.cafeSupplies.hotLid} onChange={(v) => onSupplyChange('hotLid', v)} unit="원" />
                        <NumberInput label="아이스컵 (16oz)" value={config.cafeSupplies.iceCup} onChange={(v) => onSupplyChange('iceCup', v)} unit="원" />
                        <NumberInput label="아이스컵 뚜껑" value={config.cafeSupplies.iceLid} onChange={(v) => onSupplyChange('iceLid', v)} unit="원" />
                        
                        <NumberInput label="홀더" value={config.cafeSupplies.holder} onChange={(v) => onSupplyChange('holder', v)} unit="원" />
                        <NumberInput label="캐리어 (2구)" value={config.cafeSupplies.carrier} onChange={(v) => onSupplyChange('carrier', v)} unit="원" />
                        <NumberInput label="빨대 (자바라)" value={config.cafeSupplies.straw} onChange={(v) => onSupplyChange('straw', v)} unit="원" />
                        <NumberInput label="커피스틱" value={config.cafeSupplies.stick} onChange={(v) => onSupplyChange('stick', v)} unit="원" />
                        
                        <NumberInput label="냅킨" value={config.cafeSupplies.napkin} onChange={(v) => onSupplyChange('napkin', v)} unit="원" />
                        <NumberInput label="물티슈" value={config.cafeSupplies.wipe} onChange={(v) => onSupplyChange('wipe', v)} unit="원" />
                        <NumberInput label="식기세척비 (매장)" value={config.cafeSupplies.dishwashing} onChange={(v) => onSupplyChange('dishwashing', v)} unit="원" />
                        
                        <NumberInput label="물 (1잔)" value={config.cafeSupplies.water} onChange={(v) => onSupplyChange('water', v)} unit="원" />
                        <NumberInput label="얼음 (1잔)" value={config.cafeSupplies.ice} onChange={(v) => onSupplyChange('ice', v)} unit="원" />
                        <NumberInput label="시럽 (60g)" value={config.cafeSupplies.syrup} onChange={(v) => onSupplyChange('syrup', v)} unit="원" />
                        
                        <NumberInput label="원두 사용량 (1잔)" value={config.cafeSupplies.beanGrams} onChange={(v) => onSupplyChange('beanGrams', v)} unit="g" />
                        <NumberInput label="우유 사용량 (1잔)" value={config.cafeSupplies.milkMl} onChange={(v) => onSupplyChange('milkMl', v)} unit="ml" />
                    </div>
                </InputSection>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Recalculate explicitly for display in header
  const spaceRev = config.space.hourlyRate * config.space.hoursPerDay * config.space.utilizationRate * config.space.operatingDays;
  const wineRev = config.wine.avgTicketPrice * config.wine.dailyTables * config.wine.operatingDays;
  const totalFixed = 
    calculatedLaborCost + 
    config.fixed.utilities + 
    config.fixed.internet + 
    config.fixed.marketing + 
    config.fixed.maintenance + 
    config.fixed.misc;
  
  const formatSum = (n: number) => `₩${Math.round(n).toLocaleString()}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-6 flex items-start gap-2">
        <Calculator className="mt-0.5 flex-shrink-0" size={16}/>
        <p>각 사업별 상세 설정을 입력하세요. 카페는 테이크아웃, 아이스 비율 등 상세 조건에 따라 원가가 정밀하게 계산됩니다.</p>
      </div>

      {/* Render the specialized Cafe Submenu */}
      {renderCafeDetailPlanner()}

      <InputSection 
        title="🏠 공간대여 (Space Rental) 설정"
        summary={<span className="text-sm text-blue-600 font-medium">월 예상 매출: {formatSum(spaceRev)}</span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberInput label="시간당 대여료" value={config.space.hourlyRate} onChange={(v) => onConfigChange('space', 'hourlyRate', v)} unit="원" />
          <NumberInput label="일 가용 시간" value={config.space.hoursPerDay} onChange={(v) => onConfigChange('space', 'hoursPerDay', v)} unit="시간" />
          <NumberInput label="월 영업일수" value={config.space.operatingDays} onChange={(v) => onConfigChange('space', 'operatingDays', v)} unit="일" />
          <SliderInput 
            label="가동률 (예약률)" 
            value={config.space.utilizationRate} 
            onChange={(v) => onConfigChange('space', 'utilizationRate', v)} 
            step={0.05} 
            min={0}
            max={1}
          />
        </div>
      </InputSection>

      <InputSection 
        title="🍷 와인바 (Wine Bar) 설정"
        summary={<span className="text-sm text-blue-600 font-medium">월 예상 매출: {formatSum(wineRev)}</span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberInput label="테이블당 평균 단가" value={config.wine.avgTicketPrice} onChange={(v) => onConfigChange('wine', 'avgTicketPrice', v)} unit="원" />
          <NumberInput label="일 평균 테이블 수" value={config.wine.dailyTables} onChange={(v) => onConfigChange('wine', 'dailyTables', v)} unit="팀" />
          <NumberInput label="원가율 (안주+주류)" value={config.wine.costOfGoodsSoldRate} onChange={(v) => onConfigChange('wine', 'costOfGoodsSoldRate', v)} step={0.01} />
          <NumberInput label="월 영업일수" value={config.wine.operatingDays} onChange={(v) => onConfigChange('wine', 'operatingDays', v)} unit="일" />
        </div>
      </InputSection>

      <InputSection 
        title="🏢 고정비 및 초기투자 (Fixed & Initial Cost)"
        summary={
          <div className="flex flex-col text-xs md:text-sm md:flex-row md:gap-4 text-right font-medium">
             <span className="text-indigo-600">초기 투자: {formatSum(totalInvestment)}</span>
             <span className="hidden md:inline text-gray-300">|</span>
             <span className="text-blue-600">월 고정비: {formatSum(totalFixed)}</span>
          </div>
        }
      >
        <div className="space-y-6">
            {/* Improved Labor Calculator Section */}
            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
               <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-4">
                  <Briefcase size={18}/> 2026년 기준 인건비 계산기 (시급 10,320원)
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-gray-700">주중 풀타임 근무자 (주 40시간)</span>
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">209시간 기준</span>
                         </div>
                         <div className="text-lg font-bold text-gray-900 mb-3">{WEEKDAY_RATE.toLocaleString()}원 <span className="text-xs font-normal text-gray-500">/ 1인</span></div>
                         <NumberInput label="주중 인원수" value={config.fixed.weekdayStaff} onChange={(v) => onConfigChange('fixed', 'weekdayStaff', v)} unit="명" />
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-gray-700">주말 근무자 (토/일 16시간)</span>
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">83.45시간 기준</span>
                         </div>
                         <div className="text-lg font-bold text-gray-900 mb-3">{WEEKEND_RATE.toLocaleString()}원 <span className="text-xs font-normal text-gray-500">/ 1인</span></div>
                         <NumberInput label="주말 인원수" value={config.fixed.weekendStaff} onChange={(v) => onConfigChange('fixed', 'weekendStaff', v)} unit="명" />
                      </div>
                  </div>
                  <div className="flex flex-col justify-between">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50 flex-1 flex flex-col justify-center">
                         <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">총 인건비 합계</div>
                            <div className="text-3xl font-black text-blue-700">{Math.round(calculatedLaborCost).toLocaleString()}원</div>
                            <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                               <div className="flex justify-between text-xs text-gray-500">
                                  <span>주중 ({config.fixed.weekdayStaff}명)</span>
                                  <span>{(config.fixed.weekdayStaff * WEEKDAY_RATE).toLocaleString()}원</span>
                               </div>
                               <div className="flex justify-between text-xs text-gray-500">
                                  <span>주말 ({config.fixed.weekendStaff}명)</span>
                                  <span>{(config.fixed.weekendStaff * WEEKEND_RATE).toLocaleString()}원</span>
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="mt-4">
                         <NumberInput label="기타 추가 인건비 (관리/보너스 등)" value={config.fixed.additionalLabor} onChange={(v) => onConfigChange('fixed', 'additionalLabor', v)} unit="원" />
                      </div>
                  </div>
               </div>
            </div>

            <h4 className="font-medium text-gray-700 border-b pb-2 pt-4">기타 월 고정 비용</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NumberInput label="공과금 (수도/전기)" value={config.fixed.utilities} onChange={(v) => onConfigChange('fixed', 'utilities', v)} unit="원" />
                <NumberInput label="마케팅비" value={config.fixed.marketing} onChange={(v) => onConfigChange('fixed', 'marketing', v)} unit="원" />
                <NumberInput label="유지보수비" value={config.fixed.maintenance} onChange={(v) => onConfigChange('fixed', 'maintenance', v)} unit="원" />
                <NumberInput label="기타 잡비" value={config.fixed.misc} onChange={(v) => onConfigChange('fixed', 'misc', v)} unit="원" />
                <NumberInput label="인터넷/통신" value={config.fixed.internet} onChange={(v) => onConfigChange('fixed', 'internet', v)} unit="원" />
            </div>

            <h4 className="font-medium text-gray-700 border-b pb-2 pt-4">초기 투자 비용</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NumberInput label="인테리어" value={config.initial.interior} onChange={(v) => onConfigChange('initial', 'interior', v)} unit="원" />
                <NumberInput label="설비/집기" value={config.initial.equipment} onChange={(v) => onConfigChange('initial', 'equipment', v)} unit="원" />
                <NumberInput label="디자인/브랜딩" value={config.initial.design} onChange={(v) => onConfigChange('initial', 'design', v)} unit="원" />
                <NumberInput label="초도물품/기타" value={config.initial.supplies} onChange={(v) => onConfigChange('initial', 'supplies', v)} unit="원" />
            </div>
        </div>
      </InputSection>
    </div>
  );
};
