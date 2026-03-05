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
    await dbService.deleteInteriorCost(id);
    setCosts(costs.filter(c => c.id !== id));
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

  const totalCost = costs.reduce((sum, c) => sum + c.cost, 0);
  const today = new Date().toISOString().split('T')[0];

  const categoryTotals = costs.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.cost;
    return acc;
  }, {} as Record<string, number>);

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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#5d4037] flex items-center gap-2">
            <DollarSign className="text-orange-500" /> 인테리어 공사 비용 계산
          </h2>
          <div className="text-lg font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
            합계: {totalCost.toLocaleString()} 원
          </div>
        </div>

        <div className="mb-6 bg-orange-50 p-4 rounded-xl">
          <h3 className="font-bold text-[#5d4037] mb-2">카테고리별 합계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryTotals).map(([cat, total]) => (
              <div key={cat} className="bg-white p-2 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">{cat}</div>
                <div className="font-bold text-orange-600">{total.toLocaleString()} 원</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded-lg" />
          <input type="text" placeholder="카테고리 (예: 철거)" value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded-lg" />
          <input type="text" placeholder="항목 (예: 폐기물 처리)" value={item} onChange={(e) => setItem(e.target.value)} className="p-2 border rounded-lg" />
          <input type="number" placeholder="비용 (원)" value={cost} onChange={(e) => setCost(e.target.value)} className="p-2 border rounded-lg" />
          <button onClick={addCost} className="bg-[#5d4037] text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#4e342e]">
            <Plus size={16} /> 추가
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-orange-100">
              <th className="p-2 cursor-pointer hover:text-orange-600" onClick={() => handleSort('date')}>
                날짜 {getSortIcon('date')}
              </th>
              <th className="p-2 cursor-pointer hover:text-orange-600" onClick={() => handleSort('category')}>
                카테고리 {getSortIcon('category')}
              </th>
              <th className="p-2 cursor-pointer hover:text-orange-600" onClick={() => handleSort('item')}>
                항목 {getSortIcon('item')}
              </th>
              <th className="p-2 text-right">비용</th>
              <th className="p-2 text-center">삭제</th>
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
                    <td className="p-2">{c.date} {c.date > today && <span className="text-[10px] font-bold bg-orange-100 px-1 rounded">예측</span>}</td>
                    <td className="p-2">{c.category}</td>
                    <td className="p-2">{c.item}</td>
                    <td className="p-2 text-right">{c.cost.toLocaleString()} 원</td>
                    <td className="p-2 text-center flex gap-2 justify-center">
                      <button onClick={() => startEdit(c)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => deleteCost(c.id)} className="text-rose-500 hover:text-rose-700"><Trash2 size={16} /></button>
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
