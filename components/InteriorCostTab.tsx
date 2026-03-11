import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Edit2, Check, X } from 'lucide-react';
import { InteriorCost } from '../types';
import { dbService } from '../db';

export const InteriorCostTab: React.FC = () => {
  const [costs, setCosts] = useState<InteriorCost[]>([]);
  const [category, setCategory] = useState('');
  const [item, setItem] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortKey, setSortKey] = useState<'date' | 'category' | 'item'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InteriorCost>>({});
  
  interface InteriorDeposit {
    id: string;
    amount: number;
    date: string;
    note: string;
  }
  
  const [deposits, setDeposits] = useState<InteriorDeposit[]>(() => {
    const saved = localStorage.getItem('terrazza_interior_deposits');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    const oldBudget = localStorage.getItem('terrazza_interior_budget');
    if (oldBudget && Number(oldBudget) > 0) {
      const initialDeposit = { id: Math.random().toString(36).substring(2, 11), amount: Number(oldBudget), date: new Date().toISOString().split('T')[0], note: '초기 예산' };
      localStorage.setItem('terrazza_interior_deposits', JSON.stringify([initialDeposit]));
      return [initialDeposit];
    }
    return [];
  });

  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [depositNote, setDepositNote] = useState('');

  const totalBudget = deposits.reduce((sum, d) => sum + d.amount, 0);

  const addDeposit = () => {
    if (!depositAmount || !depositDate) return;
    const newDeposit: InteriorDeposit = {
      id: Math.random().toString(36).substring(2, 11),
      amount: Number(depositAmount),
      date: depositDate,
      note: depositNote || '입금'
    };
    const updated = [...deposits, newDeposit];
    setDeposits(updated);
    localStorage.setItem('terrazza_interior_deposits', JSON.stringify(updated));
    setDepositAmount('');
    setDepositNote('');
  };

  const deleteDeposit = (id: string) => {
    if (window.confirm("이 입금 내역을 삭제하시겠습니까?")) {
      const updated = deposits.filter(d => d.id !== id);
      setDeposits(updated);
      localStorage.setItem('terrazza_interior_deposits', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    const loadCosts = async () => {
      const loadedCosts = await dbService.getAllInteriorCosts();
      setCosts(loadedCosts);
    };
    loadCosts();
  }, []);

  const addCost = async () => {
    if (!category || !item || !cost || !date) return;
    const newCost: InteriorCost = { 
      id: Math.random().toString(36).substring(2, 11), 
      category, 
      item, 
      cost: Number(cost), 
      date 
    };
    await dbService.saveInteriorCost(newCost);
    setCosts([...costs, newCost]);
    setCategory('');
    setItem('');
    setCost('');
  };

  const deleteCost = async (id: string) => {
    if (window.confirm("정말 이 항목을 삭제하시겠습니까?")) {
      await dbService.deleteInteriorCost(id);
      setCosts(costs.filter(c => c.id !== id));
    }
  };

  const startEdit = (cost: InteriorCost) => {
    setEditingId(cost.id);
    setEditForm(cost);
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.category || !editForm.item || !editForm.cost || !editForm.date) return;
    const updatedCost = { ...editForm } as InteriorCost;
    await dbService.saveInteriorCost(updatedCost);
    setCosts(costs.map(c => c.id === editingId ? updatedCost : c));
    setEditingId(null);
    setEditForm({});
  };

  const today = new Date().toISOString().split('T')[0];

  const actualCosts = costs.filter(c => c.date <= today);
  const estimatedCosts = costs.filter(c => c.date > today);

  const totalActual = actualCosts.reduce((sum, c) => sum + c.cost, 0);
  const totalEstimated = estimatedCosts.reduce((sum, c) => sum + c.cost, 0);

  const categoryTotals = costs.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = { actual: 0, estimated: 0 };
    if (c.date <= today) acc[c.category].actual += c.cost;
    else acc[c.category].estimated += c.cost;
    return acc;
  }, {} as Record<string, { actual: number; estimated: number }>);

  const handleSort = (key: 'date' | 'category' | 'item') => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedCosts = [...costs].sort((a, b) => {
    let comparison = 0;
    if (sortKey === 'date') comparison = a.date.localeCompare(b.date);
    else if (sortKey === 'category') comparison = a.category.localeCompare(b.category);
    else if (sortKey === 'item') comparison = a.item.localeCompare(b.item);
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getSortIcon = (key: 'date' | 'category' | 'item') => {
    if (sortKey !== key) return '↕';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white md:p-2 md:rounded-2xl md:shadow-sm md:border md:border-orange-100">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold text-[#5d4037] flex items-center gap-2">
            <DollarSign className="text-orange-500" /> 인테리어 공사 비용 계산
          </h2>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-500">총 예산 (입금액)</span>
              <button onClick={() => setShowDepositForm(!showDepositForm)} className="text-xs bg-white border border-orange-200 px-2 py-1 rounded text-orange-600 hover:bg-orange-100 font-bold transition-colors">
                {showDepositForm ? '내역 닫기' : '내역 보기 / 추가'}
              </button>
            </div>
            <div className="flex items-center justify-end gap-1">
              <span className="text-2xl font-black text-[#5d4037]">{totalBudget.toLocaleString()}</span>
              <span className="text-[#5d4037] font-bold">원</span>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col justify-center items-end">
            <span className="text-sm font-bold text-gray-500 mb-1">총 지출 (현재+예상)</span>
            <span className="text-xl font-bold text-rose-500">{(totalActual + totalEstimated).toLocaleString()} 원</span>
            <div className="text-xs text-gray-500 mt-1">
              현재: {totalActual.toLocaleString()} / 예상: {totalEstimated.toLocaleString()}
            </div>
          </div>
          <div className={`p-4 rounded-xl border flex flex-col justify-center items-end ${totalBudget - (totalActual + totalEstimated) >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <span className="text-sm font-bold text-gray-500 mb-1">현재 잔액</span>
            <span className={`text-2xl font-black ${totalBudget - (totalActual + totalEstimated) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {(totalBudget - (totalActual + totalEstimated)).toLocaleString()} 원
            </span>
          </div>
        </div>

        {showDepositForm && (
          <div className="mb-6 bg-white p-4 rounded-xl border border-emerald-200 shadow-sm mx-2">
            <h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
              <DollarSign size={16} /> 예산 입금 내역
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              <input type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)} className="p-2 border rounded-lg text-sm" />
              <input type="text" placeholder="적요 (예: 1차 대출금)" value={depositNote} onChange={e => setDepositNote(e.target.value)} className="p-2 border rounded-lg text-sm md:col-span-1" />
              <input type="number" placeholder="금액 (원)" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="p-2 border rounded-lg text-sm" />
              <button onClick={addDeposit} className="bg-emerald-600 text-white p-2 rounded-lg font-bold hover:bg-emerald-700 text-sm flex items-center justify-center gap-1">
                <Plus size={14} /> 입금 추가
              </button>
            </div>
            
            {deposits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-emerald-100 text-emerald-800">
                      <th className="p-2 font-semibold">날짜</th>
                      <th className="p-2 font-semibold">적요</th>
                      <th className="p-2 text-right font-semibold">금액</th>
                      <th className="p-2 text-center font-semibold">삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...deposits].sort((a,b) => b.date.localeCompare(a.date)).map(d => (
                      <tr key={d.id} className="border-b border-gray-50 hover:bg-emerald-50/30">
                        <td className="p-2 text-gray-600">{d.date}</td>
                        <td className="p-2 text-gray-800">{d.note}</td>
                        <td className="p-2 text-right font-bold text-emerald-600">+{d.amount.toLocaleString()} 원</td>
                        <td className="p-2 text-center">
                          <button onClick={() => deleteDeposit(d.id)} className="text-rose-400 hover:text-rose-600 p-1"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-400">입금 내역이 없습니다.</div>
            )}
          </div>
        )}

        <div className="mb-6 md:bg-orange-50 md:p-4 md:rounded-xl">
          <h3 className="font-bold text-[#5d4037] mb-4 px-2">카테고리별 요약</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
            <div>
              <h4 className="font-bold text-gray-600 mb-2">현재까지</h4>
              {Object.entries(categoryTotals).map(([cat, totals]) => (
                totals.actual > 0 && <div key={cat} className="flex justify-between text-sm py-1 border-b border-orange-100"><span>{cat}</span><span>{totals.actual.toLocaleString()}</span></div>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-orange-500 mb-2">예상</h4>
              {Object.entries(categoryTotals).map(([cat, totals]) => (
                totals.estimated > 0 && <div key={cat} className="flex justify-between text-sm py-1 border-b border-orange-100"><span>{cat}</span><span>{totals.estimated.toLocaleString()}</span></div>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-[#5d4037] mb-2">합계 (현재+예상)</h4>
              {Object.entries(categoryTotals).map(([cat, totals]) => (
                <div key={cat} className="flex justify-between text-sm py-1 border-b border-orange-100"><span>{cat}</span><span>{(totals.actual + totals.estimated).toLocaleString()}</span></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 mb-6">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded-lg w-full" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="카테고리" value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded-lg w-full" />
            <input type="text" placeholder="항목" value={item} onChange={(e) => setItem(e.target.value)} className="p-2 border rounded-lg w-full" />
          </div>
          <input type="number" placeholder="비용 (원)" value={cost} onChange={(e) => setCost(e.target.value)} className="p-2 border rounded-lg w-full" />
          <button onClick={addCost} className="bg-[#5d4037] text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#4e342e] w-full">
            <Plus size={16} /> 추가
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-orange-100 text-xs">
              <th className="p-1 cursor-pointer hover:text-orange-600 whitespace-nowrap" onClick={() => handleSort('date')}>
                날짜 {getSortIcon('date')}
              </th>
              <th className="p-1 cursor-pointer hover:text-orange-600 whitespace-nowrap" onClick={() => handleSort('category')}>
                카테고리 {getSortIcon('category')}
              </th>
              <th className="p-1 cursor-pointer hover:text-orange-600 whitespace-nowrap" onClick={() => handleSort('item')}>
                항목 {getSortIcon('item')}
              </th>
              <th className="p-1 text-right whitespace-nowrap">비용</th>
              <th className="p-1 text-center whitespace-nowrap">삭제</th>
            </tr>
          </thead>
          <tbody>
            {sortedCosts.map(c => (
              <tr key={c.id} className={`border-b border-orange-50 ${c.date > today ? 'text-orange-600' : ''}`}>
                {editingId === c.id ? (
                  <>
                    <td className="p-2"><input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="p-1 border rounded w-full" /></td>
                    <td className="p-2"><input type="text" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="p-1 border rounded w-full" /></td>
                    <td className="p-2"><input type="text" value={editForm.item} onChange={(e) => setEditForm({...editForm, item: e.target.value})} className="p-1 border rounded w-full" /></td>
                    <td className="p-2"><input type="number" value={editForm.cost} onChange={(e) => setEditForm({...editForm, cost: Number(e.target.value)})} className="p-1 border rounded w-full" /></td>
                    <td className="p-2 text-center flex gap-2">
                      <button onClick={saveEdit} className="text-emerald-600"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="text-slate-500"><X size={16} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-1 text-xs whitespace-nowrap">{c.date.substring(5)} {c.date > today && <span className="text-[10px] font-bold bg-orange-100 px-1 rounded">예측</span>}</td>
                    <td className="p-1 text-xs whitespace-nowrap">{c.category}</td>
                    <td className="p-1 text-xs whitespace-nowrap">{c.item}</td>
                    <td className="p-1 text-xs text-right whitespace-nowrap">{c.cost.toLocaleString()} 원</td>
                    <td className="p-1 text-center flex gap-1 justify-center">
                      <button onClick={() => startEdit(c)} className="text-blue-500 hover:text-blue-700"><Edit2 size={14} /></button>
                      <button onClick={() => deleteCost(c.id)} className="text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
