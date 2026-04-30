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
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(201, 150, 58, 0.15)' }}>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{color: 'var(--cream)'}}>
            <DollarSign style={{color: 'var(--amber)'}} /> 인테리어 공사 비용 계산
          </h2>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
          <div style={{background: 'rgba(201, 150, 58, 0.05)', borderColor: 'rgba(201, 150, 58, 0.1)'}} className="p-4 rounded-xl border flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold" style={{color: 'var(--mist)'}}>총 예산 (입금액)</span>
              <button onClick={() => setShowDepositForm(!showDepositForm)} style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }} className="text-xs bg-transparent border px-2 py-1 rounded hover:bg-orange-50 font-bold transition-colors">
                {showDepositForm ? '내역 닫기' : '내역 보기 / 추가'}
              </button>
            </div>
            <div className="flex items-center justify-end gap-1">
              <span className="text-2xl font-black" style={{color: 'var(--cream)'}}>{totalBudget.toLocaleString()}</span>
              <span className="font-bold" style={{color: 'var(--cream)'}}>원</span>
            </div>
          </div>
          <div style={{background: 'rgba(201, 150, 58, 0.05)', borderColor: 'rgba(201, 150, 58, 0.1)'}} className="p-4 rounded-xl border flex flex-col justify-center items-end">
            <span className="text-sm font-bold mb-1" style={{color: 'var(--mist)'}}>총 지출 (현재+예상)</span>
            <span className="text-xl font-bold text-rose-500">{(totalActual + totalEstimated).toLocaleString()} 원</span>
            <div className="text-xs mt-1" style={{color: 'var(--stone)'}}>
              현재: {totalActual.toLocaleString()} / 예상: {totalEstimated.toLocaleString()}
            </div>
          </div>
          <div className={`p-4 rounded-xl border flex flex-col justify-center items-end`} style={{background: totalBudget - (totalActual + totalEstimated) >= 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)', borderColor: totalBudget - (totalActual + totalEstimated) >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}}>
            <span className="text-sm font-bold mb-1" style={{color: 'var(--mist)'}}>현재 잔액</span>
            <span className={`text-2xl font-black ${totalBudget - (totalActual + totalEstimated) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(totalBudget - (totalActual + totalEstimated)).toLocaleString()} 원
            </span>
          </div>
        </div>

        {showDepositForm && (
          <div className="mb-6 p-4 rounded-xl border shadow-sm mx-2" style={{background: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.2)'}}>
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{color: 'var(--cream)'}}>
              <DollarSign size={16} className="text-emerald-400" /> 예산 입금 내역
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              <input type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)} className="p-2 rounded-lg text-sm" style={{background: 'var(--bg-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--cream)'}} />
              <input type="text" placeholder="적요 (예: 1차 대출금)" value={depositNote} onChange={e => setDepositNote(e.target.value)} className="p-2 rounded-lg text-sm md:col-span-1" style={{background: 'var(--bg-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--cream)'}} />
              <input type="number" placeholder="금액 (원)" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="p-2 rounded-lg text-sm" style={{background: 'var(--bg-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--cream)'}} />
              <button onClick={addDeposit} className="p-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#34d399'}}>
                <Plus size={14} className="text-emerald-400" /> <span className="text-emerald-400">입금 추가</span>
              </button>
            </div>
            
            {deposits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b" style={{borderColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399'}}>
                      <th className="p-2 font-semibold">날짜</th>
                      <th className="p-2 font-semibold">적요</th>
                      <th className="p-2 text-right font-semibold">금액</th>
                      <th className="p-2 text-center font-semibold">삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...deposits].sort((a,b) => b.date.localeCompare(a.date)).map(d => (
                      <tr key={d.id} className="border-b transition" style={{borderColor: 'rgba(255,255,255,0.05)', color: 'var(--mist)'}}>
                        <td className="p-2">{d.date}</td>
                        <td className="p-2" style={{color: 'var(--cream)'}}>{d.note}</td>
                        <td className="p-2 text-right font-bold text-emerald-400">+{d.amount.toLocaleString()} 원</td>
                        <td className="p-2 text-center">
                          <button onClick={() => deleteDeposit(d.id)} className="text-rose-400 hover:text-rose-300 p-1 transition"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-sm" style={{color: 'var(--stone)'}}>입금 내역이 없습니다.</div>
            )}
          </div>
        )}

        <div className="mb-6 md:p-4 md:rounded-xl" style={{background: 'rgba(201, 150, 58, 0.05)'}}>
          <h3 className="font-bold mb-4 px-2" style={{color: 'var(--cream)'}}>카테고리별 요약</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
            <div>
              <h4 className="font-bold mb-2" style={{color: 'var(--mist)'}}>현재까지</h4>
              {Object.entries(categoryTotals).map(([cat, totals]) => (
                totals.actual > 0 && <div key={cat} className="flex justify-between text-sm py-1 border-b" style={{borderColor: 'rgba(201, 150, 58, 0.1)'}}><span>{cat}</span><span>{totals.actual.toLocaleString()}</span></div>
              ))}
            </div>
            <div>
              <h4 className="font-bold mb-2" style={{color: 'var(--amber)'}}>예상</h4>
              {Object.entries(categoryTotals).map(([cat, totals]) => (
                totals.estimated > 0 && <div key={cat} className="flex justify-between text-sm py-1 border-b" style={{borderColor: 'rgba(201, 150, 58, 0.1)'}}><span>{cat}</span><span>{totals.estimated.toLocaleString()}</span></div>
              ))}
            </div>
            <div>
              <h4 className="font-bold mb-2" style={{color: 'var(--cream)'}}>합계 (현재+예상)</h4>
              {Object.entries(categoryTotals).map(([cat, totals]) => (
                <div key={cat} className="flex justify-between text-sm py-1 border-b" style={{borderColor: 'rgba(201, 150, 58, 0.1)'}}><span>{cat}</span><span>{(totals.actual + totals.estimated).toLocaleString()}</span></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 mb-6">
          <input style={{background: 'var(--bg-primary)', border: '1px solid rgba(201, 150, 58, 0.2)', color: 'var(--cream)'}} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 rounded-lg w-full" />
          <div className="grid grid-cols-2 gap-2">
            <input style={{background: 'var(--bg-primary)', border: '1px solid rgba(201, 150, 58, 0.2)', color: 'var(--cream)'}} type="text" placeholder="카테고리" value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 rounded-lg w-full" />
            <input style={{background: 'var(--bg-primary)', border: '1px solid rgba(201, 150, 58, 0.2)', color: 'var(--cream)'}} type="text" placeholder="항목" value={item} onChange={(e) => setItem(e.target.value)} className="p-2 rounded-lg w-full" />
          </div>
          <input style={{background: 'var(--bg-primary)', border: '1px solid rgba(201, 150, 58, 0.2)', color: 'var(--cream)'}} type="number" placeholder="비용 (원)" value={cost} onChange={(e) => setCost(e.target.value)} className="p-2 rounded-lg w-full" />
          <button onClick={addCost} className="p-2 rounded-lg flex items-center justify-center gap-2 w-full transition font-bold" style={{background: 'rgba(201, 150, 58, 0.15)', color: 'var(--amber)'}}>
            <Plus size={16} /> 추가
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-xs" style={{borderColor: 'rgba(201, 150, 58, 0.1)'}}>
              <th className="p-1 cursor-pointer whitespace-nowrap" style={{color: 'var(--amber)'}} onClick={() => handleSort('date')}>
                날짜 {getSortIcon('date')}
              </th>
              <th className="p-1 cursor-pointer whitespace-nowrap" style={{color: 'var(--amber)'}} onClick={() => handleSort('category')}>
                카테고리 {getSortIcon('category')}
              </th>
              <th className="p-1 cursor-pointer whitespace-nowrap" style={{color: 'var(--amber)'}} onClick={() => handleSort('item')}>
                항목 {getSortIcon('item')}
              </th>
              <th className="p-1 text-right whitespace-nowrap">비용</th>
              <th className="p-1 text-center whitespace-nowrap">삭제</th>
            </tr>
          </thead>
          <tbody>
            {sortedCosts.map(c => (
              <tr key={c.id} className={`border-b transition`} style={{borderColor: 'rgba(201, 150, 58, 0.1)', color: c.date > today ? 'var(--amber)' : 'var(--cream)'}}>
                {editingId === c.id ? (
                  <>
                    <td className="p-2"><input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="p-1 rounded w-full" style={{background: 'var(--bg-primary)', border: '1px solid rgba(201,150,58,0.2)', color: 'var(--cream)'}} /></td>
                    <td className="p-2"><input type="text" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="p-1 rounded w-full" style={{background: 'var(--bg-primary)', border: '1px solid rgba(201,150,58,0.2)', color: 'var(--cream)'}} /></td>
                    <td className="p-2"><input type="text" value={editForm.item} onChange={(e) => setEditForm({...editForm, item: e.target.value})} className="p-1 rounded w-full" style={{background: 'var(--bg-primary)', border: '1px solid rgba(201,150,58,0.2)', color: 'var(--cream)'}} /></td>
                    <td className="p-2"><input type="number" value={editForm.cost} onChange={(e) => setEditForm({...editForm, cost: Number(e.target.value)})} className="p-1 rounded w-full" style={{background: 'var(--bg-primary)', border: '1px solid rgba(201,150,58,0.2)', color: 'var(--cream)'}} /></td>
                    <td className="p-2 text-center flex gap-2">
                      <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300 transition"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="text-rose-400 hover:text-rose-300 transition"><X size={16} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-1 text-xs whitespace-nowrap">{c.date.substring(5)} {c.date > today && <span className="text-[10px] font-bold px-1 rounded ml-1" style={{background: 'rgba(201, 150, 58, 0.2)', color: 'var(--amber)'}}>예측</span>}</td>
                    <td className="p-1 text-xs whitespace-nowrap" style={{color: 'var(--mist)'}}>{c.category}</td>
                    <td className="p-1 text-xs whitespace-nowrap">{c.item}</td>
                    <td className="p-1 text-xs text-right whitespace-nowrap">{c.cost.toLocaleString()} 원</td>
                    <td className="p-1 text-center flex gap-1 justify-center">
                      <button onClick={() => startEdit(c)} className="text-blue-400 hover:text-blue-300 transition"><Edit2 size={14} /></button>
                      <button onClick={() => deleteCost(c.id)} className="text-rose-400 hover:text-rose-300 transition"><Trash2 size={14} /></button>
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
