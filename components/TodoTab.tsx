
import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { TodoItem } from '../types';

interface TodoTabProps {
  todos: TodoItem[];
  onToggle: (id: string) => void;
  onAdd: (category: string, task: string, note: string) => void;
  onDelete: (id: string) => void;
}

export const TodoTab: React.FC<TodoTabProps> = ({ todos, onToggle, onAdd, onDelete }) => {
  const [newCategory, setNewCategory] = useState('운영');
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');

  // Get unique categories for dropdown
  const categories = Array.from(new Set(todos.map(t => t.category)));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    onAdd(newCategory, newTask, newNote);
    setNewTask('');
    setNewNote('');
  };

  // Group by category
  const groupedTodos = todos.reduce((acc, todo) => {
    if (!acc[todo.category]) acc[todo.category] = [];
    acc[todo.category].push(todo);
    return acc;
  }, {} as Record<string, TodoItem[]>);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">개업 준비 체크리스트</h2>
          <div className="text-gray-500 text-sm">
              진행률: {Math.round((todos.filter(t => t.completed).length / (todos.length || 1)) * 100)}%
          </div>
      </div>

      {/* Add New Item Form */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-orange-500" /> 새 항목 추가
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
          <select 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex-1 flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="할 일 입력 (예: POS기 설치 문의)" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              required
            />
            <input 
              type="text" 
              placeholder="비고 (선택사항)" 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="p-2 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-[#5d4037] text-white rounded-lg text-sm font-bold hover:bg-[#4e342e] transition-colors whitespace-nowrap self-start md:self-auto h-10"
          >
            추가하기
          </button>
        </form>
      </div>

      {Object.entries(groupedTodos).map(([category, items]) => (
        <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 font-semibold text-gray-700 border-b border-gray-200">
            {category}
          </div>
          <div className="divide-y divide-gray-100">
            {(items as TodoItem[]).map((item) => (
              <div key={item.id} className="flex items-center p-4 hover:bg-orange-50/30 transition-colors group">
                <div 
                  className={`flex-1 flex items-center cursor-pointer`}
                  onClick={() => onToggle(item.id)}
                >
                  <div className={`w-6 h-6 rounded border flex items-center justify-center mr-4 transition-all flex-shrink-0 ${item.completed ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                    {item.completed && <CheckSquare className="text-white w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {item.task}
                    </div>
                    {item.note && <div className="text-xs text-gray-500 mt-0.5">{item.note}</div>}
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
