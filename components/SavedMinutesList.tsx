import React from 'react';
import type { SavedMinute } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ExportIcon } from './icons/ExportIcon';

interface SavedMinutesListProps {
  savedMinutes: SavedMinute[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SavedMinutesList: React.FC<SavedMinutesListProps> = ({ savedMinutes, onLoad, onDelete }) => {
  const handleExport = (minute: SavedMinute) => {
    // Sanitize filename parts to prevent issues
    const safeLodgeName = minute.lodgeName.replace(/[^a-z0-9]/gi, '_');
    const filename = `Masonic_Minutes_${safeLodgeName}_${minute.lodgeNumber}_${minute.meetingDate}.txt`;
    
    const blob = new Blob([minute.minutes], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link); // Required for cross-browser compatibility
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (savedMinutes.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-md p-6 text-center text-slate-500">
        <p>You have no saved minutes.</p>
        <p className="text-sm">Generated minutes can be saved using the 'Save' button.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-md max-h-64 overflow-y-auto">
      <ul className="divide-y divide-slate-700">
        {savedMinutes.map((minute) => (
          <li key={minute.id} className="p-4 flex justify-between items-center hover:bg-slate-700/50 transition-colors duration-200">
            <div>
              <p className="font-semibold text-slate-200">{minute.lodgeName} No. {minute.lodgeNumber}</p>
              <p className="text-sm text-slate-400">Meeting Date: {minute.meetingDate}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onLoad(minute.id)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold py-1 px-3 rounded-md text-sm transition"
              >
                Load
              </button>
              <button
                onClick={() => handleExport(minute)}
                className="bg-sky-600 hover:bg-sky-500 text-slate-200 p-2 rounded-md transition"
                title="Export as .txt"
              >
                <ExportIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(minute.id)}
                className="bg-red-700 hover:bg-red-600 text-slate-200 p-2 rounded-md transition"
                title="Delete Minute"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};