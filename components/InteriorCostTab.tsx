import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Edit2, Check, X } from 'lucide-react';
import { InteriorCost, InteriorDeposit } from '../types';
import { dbService } from '../db';
import { DEFAULT_INTERIOR_COSTS, DEFAULT_INTERIOR_DEPOSITS, FINANCE_SOURCE } from '../defaultInteriorCosts';
import { seoulDate } from '../dates';
import './operations.css';

export const InteriorCostTab: React.FC = () => {
  const [costs, setCosts] = useState<InteriorCost[]>(DEFAULT_INTERIOR_COSTS);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [item, setItem] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(seoulDate);
  const [payment, setPayment] = useState('계좌이체');
  const [estimated, setEstimated] = useState(false);
  const [sortKey, setSortKey] = useState<'date' | 'category' | 'item'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InteriorCost>>({});
  
  const [deposits, setDeposits] = useState<InteriorDeposit[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('terrazza_interior_deposits_v2') || 'null');
      if (Array.isArray(saved) && saved.every(row => typeof row.id === 'string' && Number.isFinite(row.amount) && typeof row.date === 'string' && typeof row.note === 'string')) return saved;
    } catch {}
    return DEFAULT_INTERIOR_DEPOSITS;
  });
  const [oldDeposits] = useState<InteriorDeposit[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem('terrazza_interior_deposits') || '[]'); return Array.isArray(saved) ? saved : []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem('terrazza_interior_deposits_v2', JSON.stringify(deposits)); }
    catch { setError('입금 내역을 브라우저에 저장하지 못했습니다.'); }
  }, [deposits]);

  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(seoulDate);
  const [depositNote, setDepositNote] = useState('');

  const totalBudget = deposits.reduce((sum, d) => sum + d.amount, 0);

  const addDeposit = () => {
    if (!depositAmount || !depositDate || !Number.isFinite(Number(depositAmount)) || Number(depositAmount) <= 0) return;
    const newDeposit: InteriorDeposit = {
      id: Math.random().toString(36).substring(2, 11),
      amount: Number(depositAmount),
      date: depositDate,
      note: depositNote || '입금'
    };
    const updated = [...deposits, newDeposit];
    setDeposits(updated);
    setDepositAmount('');
    setDepositNote('');
  };

  const deleteDeposit = (id: string) => {
    if (window.confirm("이 입금 내역을 삭제하시겠습니까?")) {
      const updated = deposits.filter(d => d.id !== id);
      setDeposits(updated);
    }
  };

  useEffect(() => {
    const loadCosts = async () => {
      try {
        await dbService.importFinanceSource();
        const loadedCosts = await dbService.getAllInteriorCosts();
        setCosts(loadedCosts);
      } catch { setError('지출 내역을 불러오지 못했습니다.'); }
    };
    loadCosts();
  }, []);

  const addCost = async () => {
    if (!category.trim() || !item.trim() || !cost || !date || !Number.isFinite(Number(cost)) || Number(cost) <= 0) return;
    const newCost: InteriorCost = { 
      id: Math.random().toString(36).substring(2, 11), 
      category, 
      item, 
      cost: Number(cost), 
      date,
      payment,
      estimated
    };
    try { await dbService.saveInteriorCost(newCost); } catch { setError('지출 추가를 저장하지 못했습니다.'); return; }
    setCosts([...costs, newCost]);
    setCategory('');
    setItem('');
    setCost('');
  };

  const deleteCost = async (id: string) => {
    if (window.confirm("정말 이 항목을 삭제하시겠습니까?")) {
      try { await dbService.deleteInteriorCost(id); } catch { setError('지출 삭제를 저장하지 못했습니다.'); return; }
      setCosts(costs.filter(c => c.id !== id));
    }
  };

  const startEdit = (cost: InteriorCost) => {
    setEditingId(cost.id);
    setEditForm(cost);
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.category || !editForm.item || !Number.isFinite(editForm.cost) || Number(editForm.cost) <= 0) return;
    const updatedCost = { ...editForm } as InteriorCost;
    if (updatedCost.date) updatedCost.rawDate = null;
    try { await dbService.saveInteriorCost(updatedCost); } catch { setError('지출 수정을 저장하지 못했습니다.'); return; }
    setCosts(costs.map(c => c.id === editingId ? updatedCost : c));
    setEditingId(null);
    setEditForm({});
  };

  const today = seoulDate();
  const isEstimated = (c: InteriorCost) => c.estimated ?? (!c.source && c.date > today);

  const actualCosts = costs.filter(c => !isEstimated(c));
  const estimatedCosts = costs.filter(isEstimated);

  const totalActual = actualCosts.reduce((sum, c) => sum + c.cost, 0);
  const totalEstimated = estimatedCosts.reduce((sum, c) => sum + c.cost, 0);
  const directPurchases = actualCosts.filter(c => c.payment === '직접구매').reduce((sum, c) => sum + c.cost, 0);
  const cashExpenses = totalActual - directPurchases;

  const categoryTotals: Record<string, { actual: number; estimated: number }> = costs.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = { actual: 0, estimated: 0 };
    if (!isEstimated(c)) acc[c.category].actual += c.cost;
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
    if (sortKey === 'date') comparison = (a.date || '9999').localeCompare(b.date || '9999');
    else if (sortKey === 'category') comparison = a.category.localeCompare(b.category);
    else if (sortKey === 'item') comparison = a.item.localeCompare(b.item);
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getSortIcon = (key: 'date' | 'category' | 'item') => {
    if (sortKey !== key) return '↕';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  return (
    <div className="space-y-6 ops-page">
      <div className="finance-source-note"><strong>엑셀 기준 업데이트 · {FINANCE_SOURCE}</strong><br />지출 상세 53건 합계 15,796,450원. 시트 요약 12,810,950원에 빠진 추가 지출을 반영했습니다.<br />총 입금액 16,110,000원은 추가 입금 3,000,000원에 대한 사용자 확인(2026.10.13)을 반영했습니다. 추가 입금일과 도장 추가작업 180,000원의 날짜(원문 2026-10-0)는 확인이 필요합니다.</div>
      {error && <p className="ops-notice" role="alert">{error}</p>}
      {oldDeposits.length > 0 && <details className="ops-panel"><summary>이전 버전의 입금 입력 기록 ({oldDeposits.length}건)</summary><p className="ops-muted">원래 입력값은 보존했습니다. 중복 계산 방지를 위해 엑셀 기준 합계에는 포함하지 않았습니다. 추가 입금이 있다면 새 입금 내역에 등록하세요.</p>{oldDeposits.map((row, i) => <p key={i}>{row.date} · {row.note} · {row.amount.toLocaleString()}원</p>)}</details>}
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
          <div className={`p-4 rounded-xl border flex flex-col justify-center items-end`} style={{background: totalBudget - cashExpenses >= 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)', borderColor: totalBudget - cashExpenses >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}}>
            <span className="text-sm font-bold mb-1" style={{color: 'var(--mist)'}}>관리자금 현금 잔액</span>
            <span className={`text-2xl font-black ${totalBudget - cashExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(totalBudget - cashExpenses).toLocaleString()} 원
            </span>
            <span className="text-xs" style={{color: 'var(--mist)'}}>직접구매를 제외한 현금 지출 기준</span>
          </div>
        </div>

        <p className="ops-muted">현금 지출 {cashExpenses.toLocaleString()}원 · 직접구매 {directPurchases.toLocaleString()}원 · 직접구매·예상 지출까지 반영한 잔여 예산 {(totalBudget - totalActual - totalEstimated).toLocaleString()}원. 라마르조꼬 설치 견적 704,000원은 지출 등록 전 합계에 포함하지 않습니다.</p>

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
                        <td className="p-2">{d.date || '입금일 확인 필요'}</td>
                        <td className="p-2" style={{color: 'var(--cream)'}}>{d.note}<small className="block" style={{color: 'var(--mist)'}}>{d.source}</small></td>
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
          <div className="flex gap-4 items-center"><label className="ops-note">결제 구분<select style={{background: 'var(--charcoal)', padding: 8, borderRadius: 6}} value={payment} onChange={e => setPayment(e.target.value)}>{['계좌이체','법인카드','세금계산서','직접구매','기타'].map(value => <option key={value}>{value}</option>)}</select></label><label className="text-sm"><input type="checkbox" checked={estimated} onChange={e => setEstimated(e.target.checked)} /> 예상 지출</label></div>
          <button onClick={addCost} className="p-2 rounded-lg flex items-center justify-center gap-2 w-full transition font-bold" style={{background: 'rgba(201, 150, 58, 0.15)', color: 'var(--amber)'}}>
            <Plus size={16} /> 추가
          </button>
        </div>

        <div className="ops-table-wrap"><table className="w-full text-left" style={{minWidth: 900}}>
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
              <th className="p-1 whitespace-nowrap">결제 구분</th>
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
                    <td className="p-2"><select aria-label="수정 결제 구분" value={editForm.payment || '기타'} onChange={e => setEditForm({...editForm, payment: e.target.value})} style={{background: 'var(--charcoal)'}}>{[...new Set(['계좌이체','법인카드','세금계산서','직접구매','기타',editForm.payment || '기타'])].map(value => <option key={value}>{value}</option>)}</select></td>
                    <td className="p-2 text-center flex gap-2">
                      <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300 transition"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="text-rose-400 hover:text-rose-300 transition"><X size={16} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-1 text-xs whitespace-nowrap">{c.date || '2026-10 · 일자 확인 필요'} {isEstimated(c) && <span className="text-[10px] font-bold px-1 rounded ml-1" style={{background: 'rgba(201, 150, 58, 0.2)', color: 'var(--amber)'}}>예측</span>}</td>
                    <td className="p-1 text-xs whitespace-nowrap" style={{color: 'var(--mist)'}}>{c.category}</td>
                    <td className="p-1 text-xs">{c.item}<small className="block" style={{color: 'var(--mist)'}}>{c.details}{c.source && ` · ${c.source}`}</small></td>
                    <td className="p-1 text-xs text-right whitespace-nowrap">{c.cost.toLocaleString()} 원</td>
                    <td className="p-1 text-xs whitespace-nowrap">{c.payment || '미등록'}</td>
                    <td className="p-1 text-center flex gap-1 justify-center">
                      <button onClick={() => startEdit(c)} className="text-blue-400 hover:text-blue-300 transition"><Edit2 size={14} /></button>
                      <button onClick={() => deleteCost(c.id)} className="text-rose-400 hover:text-rose-300 transition"><Trash2 size={14} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
};
