
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { MinutesDisplay } from './components/MinutesDisplay';
import { SavedMinutesList } from './components/SavedMinutesList';
import { BrethrenManager } from './components/BrethrenManager';
import { generateMinutes } from './services/geminiService';
import type { MeetingDetails, SavedMinute, Brother } from './types';

const App: React.FC = () => {
  const [generatedMinutes, setGeneratedMinutes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMinutes, setSavedMinutes] = useState<SavedMinute[]>([]);
  const [currentDetails, setCurrentDetails] = useState<MeetingDetails | null>(null);
  const [brothersList, setBrothersList] = useState<Brother[]>([]);

  useEffect(() => {
    try {
      const storedMinutes = localStorage.getItem('masonicMinutesArchive');
      if (storedMinutes) {
        setSavedMinutes(JSON.parse(storedMinutes));
      }
      const storedBrethren = localStorage.getItem('masonicBrethrenList');
      if (storedBrethren) {
        const parsedBrethren = JSON.parse(storedBrethren);
        // Migration: Check if data is in the old string[] format
        if (Array.isArray(parsedBrethren) && parsedBrethren.length > 0 && typeof parsedBrethren[0] === 'string') {
            const migratedBrethren: Brother[] = parsedBrethren.map((name: string) => ({ name, title: 'Brother' }));
            setBrothersList(migratedBrethren);
            localStorage.setItem('masonicBrethrenList', JSON.stringify(migratedBrethren)); // Save back in new format
        } else {
            setBrothersList(parsedBrethren);
        }
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);

  const handleGenerate = useCallback(async (details: MeetingDetails, notes: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedMinutes('');
    setCurrentDetails(details);
    try {
      const minutes = await generateMinutes(details, notes);
      setGeneratedMinutes(minutes);
    // FIX: Added curly braces to the catch block to correctly handle errors and fix a syntax error that was causing cascading issues.
    } catch (err) {
      setError(err instanceof Error ? `Failed to generate minutes: ${err.message}` : 'An unknown error occurred.');
      setCurrentDetails(null); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveCurrentMinutes = useCallback(() => {
    if (!generatedMinutes || !currentDetails) return;

    const newSavedMinute: SavedMinute = {
      id: `${currentDetails.lodgeName}-${currentDetails.meetingDate}-${new Date().getTime()}`,
      lodgeName: currentDetails.lodgeName,
      lodgeNumber: currentDetails.lodgeNumber,
      meetingDate: currentDetails.meetingDate,
      minutes: generatedMinutes,
      savedAt: new Date().toISOString(),
    };

    setSavedMinutes(prev => {
      const updatedMinutes = [newSavedMinute, ...prev];
      localStorage.setItem('masonicMinutesArchive', JSON.stringify(updatedMinutes));
      return updatedMinutes;
    });
    
    setCurrentDetails(null); 
  }, [generatedMinutes, currentDetails]);
  
  const handleLoadMinute = useCallback((id: string) => {
    const minuteToLoad = savedMinutes.find(m => m.id === id);
    if (minuteToLoad) {
        setGeneratedMinutes(minuteToLoad.minutes);
        setError(null);
        setCurrentDetails(null);
    }
  }, [savedMinutes]);

  const handleDeleteMinute = useCallback((id: string) => {
    setSavedMinutes(prev => {
        const updatedMinutes = prev.filter(m => m.id !== id);
        localStorage.setItem('masonicMinutesArchive', JSON.stringify(updatedMinutes));
        return updatedMinutes;
    });
  }, []);

  const handleAddBrother = useCallback((brother: Brother) => {
    if (brother.name && !brothersList.some(b => b.name === brother.name)) {
        setBrothersList(prev => {
            const updatedList = [...prev, brother].sort((a, b) => a.name.localeCompare(b.name));
            localStorage.setItem('masonicBrethrenList', JSON.stringify(updatedList));
            return updatedList;
        });
    }
  }, [brothersList]);

  const handleDeleteBrother = useCallback((name: string) => {
    setBrothersList(prev => {
        const updatedList = prev.filter(b => b.name !== name);
        localStorage.setItem('masonicBrethrenList', JSON.stringify(updatedList));
        return updatedList;
    });
  }, []);


  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b-2 border-slate-700 pb-2">Meeting Details & Notes</h2>
            <InputForm onGenerate={handleGenerate} isLoading={isLoading} brothersList={brothersList} onAddBrother={handleAddBrother} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b-2 border-slate-700 pb-2">Lodge Brethren Management</h2>
            <BrethrenManager brothers={brothersList} onAdd={handleAddBrother} onDelete={handleDeleteBrother} />
          </div>
        </div>
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b-2 border-slate-700 pb-2">Saved Minutes</h2>
                <SavedMinutesList 
                    savedMinutes={savedMinutes}
                    onLoad={handleLoadMinute}
                    onDelete={handleDeleteMinute}
                />
            </div>
            <div className="flex flex-col flex-grow">
                <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b-2 border-slate-700 pb-2">Generated Minutes</h2>
                <MinutesDisplay 
                    minutes={generatedMinutes} 
                    isLoading={isLoading} 
                    error={error} 
                    onSave={handleSaveCurrentMinutes}
                    canSave={!!currentDetails && !!generatedMinutes && !isLoading}
                />
            </div>
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Masonic Minutes Generator &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
