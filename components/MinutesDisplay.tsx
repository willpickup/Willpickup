
import React, { useState, useEffect } from 'react';
import { Loader } from './Loader';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { SaveIcon } from './icons/SaveIcon';

interface MinutesDisplayProps {
  minutes: string;
  isLoading: boolean;
  error: string | null;
  onSave: () => void;
  canSave: boolean;
}

export const MinutesDisplay: React.FC<MinutesDisplayProps> = ({ minutes, isLoading, error, onSave, canSave }) => {
    const [copySuccess, setCopySuccess] = useState<string>('');
    const [saveSuccess, setSaveSuccess] = useState<string>('');

    useEffect(() => {
        if(copySuccess) {
            const timer = setTimeout(() => setCopySuccess(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [copySuccess]);

    useEffect(() => {
        if(saveSuccess) {
            const timer = setTimeout(() => setSaveSuccess(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveSuccess]);

    const handleCopy = async () => {
        if (!minutes) return;
        try {
            await navigator.clipboard.writeText(minutes);
            setCopySuccess('Copied!');
        } catch (err) {
            setCopySuccess('Failed to copy.');
        }
    };

    const handleSave = () => {
        if (!canSave) return;
        onSave();
        setSaveSuccess('Saved!');
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Loader />
                    <p className="mt-4 text-lg">Generating minutes, please wait...</p>
                    <p className="text-sm">This may take a moment.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-full text-red-400">
                    <p>{error}</p>
                </div>
            );
        }

        if (!minutes) {
            return (
                <div className="flex items-center justify-center h-full text-slate-500">
                    <p>Your generated minutes will appear here.</p>
                </div>
            );
        }

        return (
            <div className="prose prose-invert prose-slate max-w-none whitespace-pre-wrap">
                {minutes}
            </div>
        );
    }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-md p-6 relative flex-grow flex flex-col h-full min-h-[400px]">
        {minutes && !isLoading && (
            <div className="absolute top-4 right-4 flex gap-2">
                <button
                    onClick={handleSave}
                    className="flex items-center bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md transition duration-200 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                    title="Save Minutes"
                    disabled={!canSave}
                >
                    <SaveIcon className="h-5 w-5 mr-2" />
                    {saveSuccess || 'Save'}
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md transition duration-200"
                    title="Copy to Clipboard"
                >
                    <ClipboardIcon className="h-5 w-5 mr-2" />
                    {copySuccess || 'Copy'}
                </button>
            </div>
        )}
      <div className="overflow-y-auto flex-grow pr-4">
        {renderContent()}
      </div>
    </div>
  );
};
