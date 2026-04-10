
import React, { useState, useMemo } from 'react';
import { CheckSquare } from 'lucide-react';

interface ChecklistItem {
  id: string;
  item: string;
  model: string;
  quantity: number;
  price: number;
  note: string;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: '1', item: '1200테이블냉장고', model: '라셀르간냉식', quantity: 1, price: 700000, note: '중고' },
  { id: '2', item: '50kg 제빙기', model: '브레마', quantity: 1, price: 750000, note: '중고,콤프신품' },
  { id: '3', item: '식기세척기', model: '도어타입', quantity: 1, price: 800000, note: '중고,렉포함' },
  { id: '4', item: '', model: '', quantity: 1, price: 1100000, note: '신품,렉포함' },
  { id: '5', item: '세제,린스', model: '', quantity: 1, price: 50000, note: '' },
  { id: '6', item: '900제과쇼케이스', model: '뒷문,사각', quantity: 1, price: 700000, note: '중고' },
  { id: '7', item: '블렌더믹서', model: '바스토', quantity: 1, price: 450000, note: '중고,볼제외' },
  { id: '8', item: '컨벡션오븐', model: '우녹스', quantity: 1, price: 1200000, note: '중고,선반별도' },
  { id: '9', item: '', model: '소프트밀', quantity: 1, price: 1200000, note: '중고,선반별도' },
  { id: '10', item: '전자동커피머신', model: 'WMF(독일)', quantity: 1, price: 12000000, note: '중고' },
  { id: '11', item: '', model: '세코(이태리)', quantity: 1, price: 4200000, note: '중고' },
  { id: '12', item: '', model: '닥터커피F15', quantity: 1, price: 1800000, note: '신품' },
  { id: '13', item: '정수필터', model: 'FN6', quantity: 1, price: 150000, note: '신품,헤드포함' },
  { id: '14', item: '', model: 'PF6', quantity: 1, price: 100000, note: '신품,헤드포함' },
  { id: '15', item: '그라인더', model: '말코닉 EK43', quantity: 1, price: 2500000, note: '중고' },
  { id: '16', item: '메져슈퍼졸리', model: '', quantity: 1, price: 600000, note: '중고' },
  { id: '17', item: '현장설치비', model: '', quantity: 2, price: 250000, note: '기존 장비포함' },
];

export const TodoTab: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const updateQuantity = (id: string, delta: number) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const totalAmount = useMemo(() => {
    return checklist.reduce((sum, item) => {
      if (selectedIds.has(item.id)) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);
  }, [selectedIds, checklist]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">장비 체크리스트</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="p-3 text-center">선택</th>
              <th className="p-3">품명</th>
              <th className="p-3">모델</th>
              <th className="p-3 text-center">수량</th>
              <th className="p-3 text-right">단가</th>
              <th className="p-3 text-right">금액</th>
              <th className="p-3">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {checklist.map((item) => (
              <tr key={item.id} className={`hover:bg-orange-50/30 transition-colors ${selectedIds.has(item.id) ? 'bg-orange-50' : ''}`}>
                <td className="p-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </td>
                <td className="p-3 font-medium text-gray-800">{item.item}</td>
                <td className="p-3 text-gray-600">{item.model}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600 font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium text-gray-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="p-3 text-right text-gray-600">{item.price.toLocaleString()}</td>
                <td className="p-3 text-right font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()}</td>
                <td className="p-3 text-gray-500 text-xs">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fixed Bottom Total Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-5xl mx-auto flex flex-col gap-1">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>공급가액</span>
            <span>{totalAmount.toLocaleString()} 원</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>부가세 (10%)</span>
            <span>{Math.round(totalAmount * 0.1).toLocaleString()} 원</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-[#5d4037] border-t border-gray-100 pt-1 mt-1">
            <span>합계</span>
            <span className="text-2xl font-black">{Math.round(totalAmount * 1.1).toLocaleString()} 원</span>
          </div>
        </div>
      </div>
    </div>
  );
};
