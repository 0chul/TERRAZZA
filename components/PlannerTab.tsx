
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
    <div className="flex justify-between text-xs mb-1" style={{color: 'var(--mist)'}}>
      <span>{label}</span>
      <span>{Math.round(value)}원</span>
    </div>
  );

  const CostDetailCard = ({ title, items, total }: { title: string, items: {label: string, value: number}[], total: number }) => (
    <div className="p-3 rounded border h-full" style={{background: 'var(--bg-card)', borderColor: 'rgba(201, 150, 58, 0.15)'}}>
      <div className="text-xs font-bold mb-2 border-b pb-1" style={{color: 'var(--cream)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>{title}</div>
      <div className="space-y-1 mb-2">
        {items.map((item, idx) => (
          <CostDetailItem key={idx} label={item.label} value={item.value} />
        ))}
      </div>
      <div className="border-t pt-1 flex justify-between font-bold text-xs" style={{borderColor: 'rgba(201, 150, 58, 0.1)', color: 'var(--amber)'}}>
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
          <div className="grid grid-cols-4 gap-2 p-3 border-t" style={{background: 'rgba(201, 150, 58, 0.02)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>
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
      <div className="bg-white rounded-lg overflow-hidden mb-6" style={{background: 'var(--bg-card)', border: '1px solid rgba(201, 150, 58, 0.15)'}}>
        <button
          onClick={() => setCafeDetailsOpen(!cafeDetailsOpen)}
          className="w-full px-6 py-4 flex items-center justify-between transition-colors border-l-4"
          style={{background: 'rgba(201, 150, 58, 0.05)', borderLeftColor: 'var(--amber)'}}
        >
          <div className="flex items-center gap-3">
             <Coffee style={{color: 'var(--amber)'}} size={24}/>
             <div className="text-left">
                <span className="block font-bold text-lg" style={{color: 'var(--cream)'}}>카페 (Cafe) 상세 설정</span>
                <span className="text-xs" style={{color: 'var(--stone)'}}>테이크아웃/매장/HOT/ICE 및 좌석 회전율 기반 매출 예측</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <span className="text-sm font-bold" style={{color: 'var(--cream)'}}>
                    월 예상 매출: <span style={{color: 'var(--amber)'}}>₩{Math.round(currentCafeRevenue).toLocaleString()}</span>
                </span>
             </div>
             {cafeDetailsOpen ? <ChevronDown size={24} style={{color: 'var(--amber)'}} /> : <ChevronRight size={24} style={{color: 'var(--mist)'}} />}
          </div>
        </button>
        
        {cafeDetailsOpen && (
          <div className="p-6 border-t space-y-8" style={{borderColor: 'rgba(201, 150, 58, 0.1)'}}>
            {/* 1. Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Column 1: Capacity & Turnover (New) */}
               <div className="space-y-4 p-4 rounded-lg border" style={{background: 'rgba(201, 150, 58, 0.03)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2" style={{color: 'var(--cream)'}}>
                    <Users size={16}/> 매출/회전율 예측
                  </h4>
                  
                  <div className="bg-white p-3 rounded border shadow-sm mb-4" style={{background: 'var(--bg-card)', borderColor: 'rgba(201, 150, 58, 0.15)'}}>
                     <div className="flex justify-between text-sm mb-1" style={{color: 'var(--mist)'}}>
                        <span>일 최대 회전 좌석</span>
                        <span className="font-bold" style={{color: 'var(--cream)'}}>{maxCapacity}석</span>
                     </div>
                     <div className="flex justify-between text-lg font-bold items-center border-t pt-1 mt-1" style={{borderColor: 'rgba(201, 150, 58, 0.1)', color: 'var(--amber)'}}>
                        <span>일일 판매량</span>
                        <span>{dailySalesCount} 잔/팀</span>
                     </div>
                  </div>

                  <NumberInput label="총 좌석 수" value={config.cafe.seatCount} onChange={(v) => onConfigChange('cafe', 'seatCount', v)} unit="석" />
                  
                  {/* Operating Days Selector */}
                  <div className="flex flex-col">
                     <label className="text-xs font-semibold text-[var(--stone)] uppercase tracking-wide mb-1">운영 일수 (월 평균)</label>
                     <div className="grid grid-cols-3 gap-1 bg-[var(--bg-primary)] p-1 rounded-md border border-[rgba(201,150,58,0.2)] shadow-sm">
                        {[
                           { label: '주 5일', val: 21.7 },
                           { label: '주 6일', val: 26.1 },
                           { label: '365일', val: 30.4 }
                        ].map((opt) => (
                           <button
                              key={opt.label}
                              onClick={() => onConfigChange('cafe', 'operatingDays', opt.val)}
                              className={`text-xs py-2 rounded font-bold transition-all ${
                                 Math.abs(config.cafe.operatingDays - opt.val) < 0.5
                                 ? 'bg-[var(--amber)] text-[var(--bg-primary)] shadow-sm'
                                 : 'text-[var(--stone)] hover:bg-[rgba(201,150,58,0.1)] hover:text-[var(--amber)]'
                              }`}
                           >
                              {opt.label}
                           </button>
                        ))}
                     </div>
                     <div className="text-right text-[10px] mt-1 font-medium" style={{color: 'var(--mist)'}}>
                        * 월 평균 {config.cafe.operatingDays.toFixed(1)}일 영업
                     </div>
                  </div>

                  <NumberInput label="일 영업 시간" value={config.cafe.operatingHours} onChange={(v) => onConfigChange('cafe', 'operatingHours', v)} unit="시간" />
                  <NumberInput label="고객 평균 점유시간" value={config.cafe.stayDuration} onChange={(v) => onConfigChange('cafe', 'stayDuration', v)} unit="시간" step={0.5} />
                  
                  <div className="mt-4 pt-4 border-t" style={{borderColor: 'rgba(201, 150, 58, 0.1)'}}>
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
               <div className="space-y-4 p-4 rounded-lg border" style={{background: 'rgba(201, 150, 58, 0.03)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2" style={{color: 'var(--cream)'}}>
                    <TrendingUp size={16}/> 판매 비중 설정
                  </h4>
                  <div className="p-2 rounded border mb-4" style={{
                    background: isRatioValid ? 'rgba(52, 211, 153, 0.05)' : 'rgba(248, 113, 113, 0.05)',
                    borderColor: isRatioValid ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'
                  }}>
                     <div className="text-xs text-[var(--stone)] mb-1">메뉴 비중 합계 (1.0 맞춰주세요)</div>
                     <div className="text-xl font-black" style={{ color: isRatioValid ? '#34d399' : '#f87171' }}>
                        {(totalRatio).toFixed(2)} <span className="text-sm font-bold" style={{color: 'var(--stone)'}}>/ 1.00</span>
                     </div>
                  </div>
                  
                  <SliderInput label="아메리카노 비중" value={config.cafe.ratioAmericano} onChange={(v) => onConfigChange('cafe', 'ratioAmericano', v)} step={0.05} />
                  <SliderInput label="카페라떼 비중" value={config.cafe.ratioLatte} onChange={(v) => onConfigChange('cafe', 'ratioLatte', v)} step={0.05} />
                  <SliderInput label="시럽라떼 비중" value={config.cafe.ratioSyrupLatte} onChange={(v) => onConfigChange('cafe', 'ratioSyrupLatte', v)} step={0.05} />
                  
                  <div className="my-4 border-t border-[rgba(201,150,58,0.1)]"></div>
                  
                  <SliderInput label="테이크아웃 비율" value={config.cafe.takeoutRatio} onChange={(v) => onConfigChange('cafe', 'takeoutRatio', v)} step={0.05} />
                  <SliderInput label="아이스 음료 비율" value={config.cafe.iceRatio} onChange={(v) => onConfigChange('cafe', 'iceRatio', v)} step={0.05} />
               </div>

               {/* Column 3: Costs & Prices */}
               <div className="space-y-6">
                  {/* Prices */}
                   <div className="space-y-4 p-4 rounded-lg border" style={{background: 'rgba(201, 150, 58, 0.03)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>
                      <h4 className="font-semibold mb-2 flex items-center gap-2" style={{color: 'var(--cream)'}}>
                        <DollarSign size={16}/> 판매가 설정
                      </h4>
                      <NumberInput label="아메리카노" value={config.cafe.avgPriceAmericano} onChange={(v) => onConfigChange('cafe', 'avgPriceAmericano', v)} unit="원" />
                      <NumberInput label="카페라떼" value={config.cafe.avgPriceLatte} onChange={(v) => onConfigChange('cafe', 'avgPriceLatte', v)} unit="원" />
                      <NumberInput label="시럽라떼" value={config.cafe.avgPriceSyrupLatte} onChange={(v) => onConfigChange('cafe', 'avgPriceSyrupLatte', v)} unit="원" />
                   </div>

                   {/* Materials */}
                   <div className="space-y-4 p-4 rounded-lg border" style={{background: 'rgba(201, 150, 58, 0.03)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>
                      <h4 className="font-semibold mb-2 flex items-center gap-2" style={{color: 'var(--cream)'}}>
                        <Calculator size={16}/> 재료비 설정
                      </h4>
                      <NumberInput label="원두 가격 (1kg)" value={config.cafe.beanPricePerKg} onChange={(v) => onConfigChange('cafe', 'beanPricePerKg', v)} unit="원" />
                      <NumberInput label="우유 가격 (1L)" value={config.cafe.milkPricePerL} onChange={(v) => onConfigChange('cafe', 'milkPricePerL', v)} unit="원" />
                      <div className="pt-2 text-xs space-y-1" style={{color: 'var(--stone)'}}>
                        <div className="flex justify-between">
                            <span>원두 1잔({config.cafeSupplies.beanGrams}g)</span>
                            <span className="font-bold" style={{color: 'var(--cream)'}}>{Math.round(cafeUnitCosts.unitCosts.bean)}원</span>
                        </div>
                        <div className="flex justify-between">
                            <span>우유 1잔({config.cafeSupplies.milkMl}ml)</span>
                            <span className="font-bold" style={{color: 'var(--cream)'}}>{Math.round(cafeUnitCosts.unitCosts.milk)}원</span>
                        </div>
                         <div className="flex justify-between">
                            <span>시럽 1회(30ml)</span>
                            <span className="font-bold text-amber-600" style={{color: 'var(--amber)'}}>+{Math.round(cafeUnitCosts.unitCosts.syrup)}원</span>
                        </div>
                      </div>
                   </div>
               </div>
            </div>

            {/* 2. Detailed Cost Breakdown Matrix */}
            <div>
              <h4 className="font-bold mb-3 text-sm uppercase tracking-wide flex justify-between items-end" style={{color: 'var(--cream)'}}>
                  <span>상황별 1잔 원가 분석표 (Cost Matrix)</span>
                  <span className="text-xs normal-case font-normal" style={{color: 'var(--stone)'}}>비중: Takeout {config.cafe.takeoutRatio*100}% | Ice {config.cafe.iceRatio*100}%</span>
              </h4>
              <div className="overflow-x-auto border rounded-lg shadow-sm" style={{borderColor: 'rgba(201, 150, 58, 0.1)'}}>
                <table className="w-full text-sm text-right">
                    <thead className="border-b" style={{background: 'rgba(201, 150, 58, 0.05)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>
                        <tr>
                            <th className="px-4 py-3 text-left w-32 font-bold" style={{color: 'var(--cream)'}}>구분</th>
                            <th className="px-4 py-3" style={{color: 'var(--mist)'}}>Takeout (Hot)</th>
                            <th className="px-4 py-3" style={{color: 'var(--mist)'}}>Takeout (Ice)</th>
                            <th className="px-4 py-3" style={{color: 'var(--mist)'}}>매장 (Hot)</th>
                            <th className="px-4 py-3" style={{color: 'var(--mist)'}}>매장 (Ice)</th>
                            <th className="px-4 py-3 font-bold" style={{background: 'var(--bg-card)', color: 'var(--amber)'}}>최종 가중평균</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(201,150,58,0.1)]">
                        {/* Americano Row */}
                        <tr onClick={() => toggleCostRow('americano')} className="cursor-pointer transition-colors group" style={{background: expandedCostRows.has('americano') ? 'rgba(201,150,58,0.05)' : 'transparent'}} onMouseEnter={(e) => e.currentTarget.style.background='rgba(201, 150, 58, 0.05)'} onMouseLeave={(e) => e.currentTarget.style.background=expandedCostRows.has('americano') ? 'rgba(201,150,58,0.05)' : 'transparent'}>
                            <td className="px-4 py-3 text-left font-semibold text-[var(--cream)] flex items-center gap-2">
                                {expandedCostRows.has('americano') ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-[var(--stone)] group-hover:text-[var(--mist)]"/>}
                                아메리카노
                            </td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.takeout.hot.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.takeout.ice.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.store.hot.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.store.ice.americano).toLocaleString()}원</td>
                            <td className="px-4 py-3 font-bold bg-[rgba(201,150,58,0.1)] text-[var(--amber)] border-l border-[rgba(201,150,58,0.2)]">
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
                        <tr onClick={() => toggleCostRow('latte')} className="hover:bg-[rgba(201,150,58,0.05)] cursor-pointer transition-colors group">
                            <td className="px-4 py-3 text-left font-semibold text-[var(--cream)] flex items-center gap-2">
                                {expandedCostRows.has('latte') ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-[var(--stone)] group-hover:text-[var(--mist)]"/>}
                                카페라떼
                            </td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.takeout.hot.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.takeout.ice.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.store.hot.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.store.ice.latte).toLocaleString()}원</td>
                            <td className="px-4 py-3 font-bold bg-[rgba(201,150,58,0.1)] text-[var(--amber)] border-l border-[rgba(201,150,58,0.2)]">
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
                        <tr onClick={() => toggleCostRow('syrupLatte')} className="hover:bg-[rgba(201,150,58,0.05)] cursor-pointer transition-colors group bg-[rgba(201,150,58,0.03)]">
                            <td className="px-4 py-3 text-left font-semibold text-[var(--cream)] flex items-center gap-2">
                                {expandedCostRows.has('syrupLatte') ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-[var(--stone)] group-hover:text-[var(--mist)]"/>}
                                시럽 라떼
                            </td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.takeout.hot.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.takeout.ice.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.store.hot.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 text-[var(--mist)]">{Math.round(cafeUnitCosts.products.store.ice.syrupLatte).toLocaleString()}원</td>
                            <td className="px-4 py-3 font-bold bg-[rgba(201,150,58,0.1)] text-[var(--amber)] border-l border-[rgba(201,150,58,0.2)]">
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
              <p className="mt-2 text-xs text-[var(--stone)]">
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

  const spaceRev = 
    (config.space.partSAvgPrice * config.space.partSCountPerMonth) + 
    (config.space.partMAvgPrice * config.space.partMCountPerMonth) + 
    (config.space.fullHalfAvgPrice * config.space.fullHalfCountPerMonth) + 
    (config.space.fullFullAvgPrice * config.space.fullFullCountPerMonth) + 
    (config.space.exhibitionAvgPrice * config.space.exhibitionCountPerMonth);

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
      <div className="p-4 rounded-lg text-sm mb-6 flex items-start gap-2" style={{background: 'rgba(201, 150, 58, 0.05)', color: '#ffffff', border: '1px solid rgba(201, 150, 58, 0.1)'}}>
        <Calculator className="mt-0.5 flex-shrink-0" size={16} style={{color: 'var(--amber)'}}/>
        <p style={{color: '#ffffff'}}>각 사업별 상세 설정을 입력하세요. 카페는 테이크아웃, 아이스 비율 등 상세 조건에 따라 원가가 정밀하게 계산됩니다.</p>
      </div>

      {/* Render the specialized Cafe Submenu */}
      {renderCafeDetailPlanner()}

      <InputSection 
        title="🏠 공간대여 (Space Rental) 설정"
        summary={<span className="text-sm font-medium" style={{color: '#ffffff'}}>월 예상 매출: {formatSum(spaceRev)}</span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <NumberInput label="부분대관 S (라운지/프라이빗) 월 예상건수" value={config.space.partSCountPerMonth} onChange={(v) => onConfigChange('space', 'partSCountPerMonth', v)} unit="건" />
           <NumberInput label="부분대관 S 평균단가" value={config.space.partSAvgPrice} onChange={(v) => onConfigChange('space', 'partSAvgPrice', v)} step={10000} unit="원" />
           
           <NumberInput label="부분대관 M (세미나존) 월 예상건수" value={config.space.partMCountPerMonth} onChange={(v) => onConfigChange('space', 'partMCountPerMonth', v)} unit="건" />
           <NumberInput label="부분대관 M 평균단가" value={config.space.partMAvgPrice} onChange={(v) => onConfigChange('space', 'partMAvgPrice', v)} step={10000} unit="원" />
           
           <NumberInput label="전관대관 Half 월 예상건수" value={config.space.fullHalfCountPerMonth} onChange={(v) => onConfigChange('space', 'fullHalfCountPerMonth', v)} unit="건" />
           <NumberInput label="전관대관 Half 평균단가" value={config.space.fullHalfAvgPrice} onChange={(v) => onConfigChange('space', 'fullHalfAvgPrice', v)} step={10000} unit="원" />
           
           <NumberInput label="전관대관 Full 월 예상건수" value={config.space.fullFullCountPerMonth} onChange={(v) => onConfigChange('space', 'fullFullCountPerMonth', v)} unit="건" />
           <NumberInput label="전관대관 Full 평균단가" value={config.space.fullFullAvgPrice} onChange={(v) => onConfigChange('space', 'fullFullAvgPrice', v)} step={10000} unit="원" />
           
           <NumberInput label="전시 패키지 월 예상건수" value={config.space.exhibitionCountPerMonth} onChange={(v) => onConfigChange('space', 'exhibitionCountPerMonth', v)} unit="건" />
           <NumberInput label="전시 패키지 평균단가" value={config.space.exhibitionAvgPrice} onChange={(v) => onConfigChange('space', 'exhibitionAvgPrice', v)} step={100000} unit="원" />
        </div>
      </InputSection>

      <InputSection 
        title="🍷 와인바 (Wine Bar) 설정"
        summary={<span className="text-sm font-medium" style={{color: '#ffffff'}}>월 예상 매출: {formatSum(wineRev)}</span>}
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
             <span style={{color: '#ffffff'}}>초기 투자: {formatSum(totalInvestment)}</span>
             <span className="hidden md:inline" style={{color: 'var(--stone)'}}>|</span>
             <span style={{color: 'var(--amber)'}}>월 고정비: {formatSum(totalFixed)}</span>
          </div>
        }
      >
        <div className="space-y-6">
            {/* Improved Labor Calculator Section */}
            <div className="rounded-xl p-5 border" style={{background: 'rgba(201, 150, 58, 0.03)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>
               <h4 className="font-bold flex items-center gap-2 mb-4" style={{color: 'var(--cream)'}}>
                  <Briefcase size={18} style={{color: 'var(--amber)'}}/> 2026년 기준 인건비 계산기 (시급 10,320원)
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <div className="p-4 rounded-lg border" style={{background: 'var(--bg-card)', borderColor: 'rgba(201, 150, 58, 0.1)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold" style={{color: 'var(--cream)'}}>주중 풀타임 근무자 (주 40시간)</span>
                            <span className="text-xs px-2 py-0.5 rounded" style={{background: 'rgba(201, 150, 58, 0.05)', color: 'var(--mist)'}}>209시간 기준</span>
                         </div>
                         <div className="text-lg font-bold mb-3" style={{color: 'var(--cream)'}}>{WEEKDAY_RATE.toLocaleString()}원 <span className="text-xs font-normal" style={{color: 'var(--stone)'}}>/ 1인</span></div>
                         <NumberInput label="주중 인원수" value={config.fixed.weekdayStaff} onChange={(v) => onConfigChange('fixed', 'weekdayStaff', v)} unit="명" />
                      </div>
                      <div className="p-4 rounded-lg border" style={{background: 'var(--bg-card)', borderColor: 'rgba(201, 150, 58, 0.1)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold" style={{color: 'var(--cream)'}}>주말 근무자 (토/일 16시간)</span>
                            <span className="text-xs px-2 py-0.5 rounded" style={{background: 'rgba(201, 150, 58, 0.05)', color: 'var(--mist)'}}>83.45시간 기준</span>
                         </div>
                         <div className="text-lg font-bold mb-3" style={{color: 'var(--cream)'}}>{WEEKEND_RATE.toLocaleString()}원 <span className="text-xs font-normal" style={{color: 'var(--stone)'}}>/ 1인</span></div>
                         <NumberInput label="주말 인원수" value={config.fixed.weekendStaff} onChange={(v) => onConfigChange('fixed', 'weekendStaff', v)} unit="명" />
                      </div>
                  </div>
                  <div className="flex flex-col justify-between">
                      <div className="p-4 rounded-lg flex-1 flex flex-col justify-center border" style={{background: 'var(--bg-card)', borderColor: 'rgba(201, 150, 58, 0.1)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
                         <div className="text-center">
                            <div className="text-sm mb-1" style={{color: 'var(--mist)'}}>총 인건비 합계</div>
                            <div className="text-3xl font-black" style={{color: 'var(--amber)'}}>{Math.round(calculatedLaborCost).toLocaleString()}원</div>
                            <div className="mt-4 pt-4 border-t space-y-2" style={{borderColor: 'rgba(201, 150, 58, 0.1)'}}>
                               <div className="flex justify-between text-xs" style={{color: 'var(--stone)'}}>
                                  <span>주중 ({config.fixed.weekdayStaff}명)</span>
                                  <span>{(config.fixed.weekdayStaff * WEEKDAY_RATE).toLocaleString()}원</span>
                               </div>
                               <div className="flex justify-between text-xs" style={{color: 'var(--stone)'}}>
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

            <h4 className="font-medium border-b pb-2 pt-4" style={{color: 'var(--cream)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>기타 월 고정 비용</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NumberInput label="공과금 (수도/전기)" value={config.fixed.utilities} onChange={(v) => onConfigChange('fixed', 'utilities', v)} unit="원" />
                <NumberInput label="마케팅비" value={config.fixed.marketing} onChange={(v) => onConfigChange('fixed', 'marketing', v)} unit="원" />
                <NumberInput label="유지보수비" value={config.fixed.maintenance} onChange={(v) => onConfigChange('fixed', 'maintenance', v)} unit="원" />
                <NumberInput label="기타 잡비" value={config.fixed.misc} onChange={(v) => onConfigChange('fixed', 'misc', v)} unit="원" />
                <NumberInput label="인터넷/통신" value={config.fixed.internet} onChange={(v) => onConfigChange('fixed', 'internet', v)} unit="원" />
            </div>

            <h4 className="font-medium border-b pb-2 pt-4" style={{color: 'var(--cream)', borderColor: 'rgba(201, 150, 58, 0.1)'}}>초기 투자 비용</h4>
            <div className="p-4 rounded-xl border flex items-center justify-between" style={{background: 'rgba(201, 150, 58, 0.05)', borderColor: 'rgba(201, 150, 58, 0.2)'}}>
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg" style={{background: 'rgba(201, 150, 58, 0.1)'}}>
                   <TrendingUp size={20} style={{color: 'var(--amber)'}}/>
                 </div>
                 <div>
                   <div className="text-xs" style={{color: 'var(--stone)'}}>인테리어 지출 내역 합계</div>
                   <div className="text-sm font-semibold" style={{color: 'var(--cream)'}}>총 초기 투자비</div>
                 </div>
               </div>
               <div className="text-2xl font-black" style={{color: 'var(--amber)'}}>
                 {totalInvestment.toLocaleString()}원
               </div>
            </div>
            <p className="text-[10px] mt-2" style={{color: 'var(--stone)'}}>* 상세 지출 내역은 '인테리어' 탭에서 관리할 수 있으며, 해당 합계가 자동으로 반영됩니다.</p>
        </div>
      </InputSection>
    </div>
  );
};
