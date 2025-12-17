import React from 'react';
import { CheckSquare } from 'lucide-react';
import { TodoItem } from '../types';

interface TodoTabProps {
  todos: TodoItem[];
  onToggle: (id: string) => void;
}

export const TodoTab: React.FC<TodoTabProps> = ({ todos, onToggle }) => {
  // Group by category
  const groupedTodos = todos.reduce((acc, todo) => {
    if (!acc[todo.category]) acc[todo.category] = [];
    acc[todo.category].push(todo);
    return acc;
  }, {} as Record<string, TodoItem[]>);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">개업 준비 체크리스트</h2>
          <div className="text-gray-500 text-sm">
              진행률: {Math.round((todos.filter(t => t.completed).length / todos.length) * 100)}%
          </div>
      </div>

      {Object.entries(groupedTodos).map(([category, items]) => (
        <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 font-semibold text-gray-700 border-b border-gray-200">
            {category}
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center p-4 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => onToggle(item.id)}>
                <div className={`w-6 h-6 rounded border flex items-center justify-center mr-4 transition-all ${item.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                  {item.completed && <CheckSquare className="text-white w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {item.task}
                  </div>
                  {item.note && <div className="text-xs text-gray-500 mt-0.5">{item.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};