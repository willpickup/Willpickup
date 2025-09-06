
import React, { useState } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import type { Brother } from '../types';

interface BrethrenManagerProps {
  brothers: Brother[];
  onAdd: (brother: Brother) => void;
  onDelete: (name: string) => void;
}

const officerTitles = ['Brother', 'PM', 'PDDGM', 'R.W.', 'M.W.'];

export const BrethrenManager: React.FC<BrethrenManagerProps> = ({ brothers, onAdd, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('Brother');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd({ name: newName.trim(), title: newTitle });
      setNewName('');
      setNewTitle('Brother');
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-md p-4 space-y-4">
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add new brother's name"
          className="flex-grow bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
        />
        <select
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
        >
          {officerTitles.map(title => <option key={title} value={title}>{title}</option>)}
        </select>
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold py-2 px-4 rounded-md transition"
        >
          Add
        </button>
      </form>
      <div className="max-h-48 overflow-y-auto border-t border-slate-700 pt-4">
        {brothers.length > 0 ? (
          <ul className="space-y-2">
            {brothers.map(brother => (
              <li key={brother.name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                <span className="text-slate-300">
                  <span className="font-semibold text-amber-300 w-12 inline-block">{brother.title}</span>
                  <span>{brother.name}</span>
                </span>
                <button
                  onClick={() => onDelete(brother.name)}
                  className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10 transition"
                  title={`Delete ${brother.name}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-center">No brethren saved yet. Add one above.</p>
        )}
      </div>
    </div>
  );
};
