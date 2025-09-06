import React, { useState } from 'react';
import type { MeetingDetails, Officer, Brother } from '../types';
import { Loader } from './Loader';

interface InputFormProps {
  onGenerate: (details: MeetingDetails, notes: string) => void;
  isLoading: boolean;
  brothersList: Brother[];
  onAddBrother: (brother: Brother) => void;
}

const officerTitles = ['Brother', 'PM', 'PDDGM', 'R.W.', 'M.W.'];

const OfficerInputGroup: React.FC<{
  label: string;
  id: keyof Omit<MeetingDetails, 'lodgeName' | 'lodgeNumber' | 'meetingDate' | 'meetingTime' | 'meetingType' | 'minuteTemplate' | 'degree' | 'brethrenPresent'>;
  officer: Officer;
  onChange: (id: any, field: keyof Officer, value: string | boolean) => void;
  brothersList: Brother[];
  onAddBrother: (brother: Brother) => void;
  placeholder?: string;
  required?: boolean;
}> = ({ label, id, officer, onChange, brothersList, onAddBrother, placeholder, required }) => {

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        onChange(id, 'name', newName);

        const matchingBrother = brothersList.find(b => b.name === newName);
        if (matchingBrother && matchingBrother.title !== officer.title) {
            onChange(id, 'title', matchingBrother.title);
        }
    };

    const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        if (name && !brothersList.some(b => b.name === name)) {
            onAddBrother({ name, title: officer.title });
        }
    };
    
    return (
        <div className="grid grid-cols-12 gap-x-2 gap-y-1 items-end">
            <div className="col-span-12 sm:col-span-6">
                <label htmlFor={`${id}-name`} className="block text-sm font-medium text-amber-300">{label}</label>
                <input
                    type="text"
                    id={`${id}-name`}
                    list={`${id}-datalist`}
                    value={officer.name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    required={required}
                    placeholder={placeholder}
                    className="mt-1 w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2.5 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                />
                <datalist id={`${id}-datalist`}>
                    {brothersList.map(brother => (
                        <option key={brother.name} value={brother.name} />
                    ))}
                </datalist>
            </div>
            <div className="col-span-6 sm:col-span-3">
                <label htmlFor={`${id}-title`} className="block text-sm font-medium text-amber-300">Title</label>
                <select
                    id={`${id}-title`}
                    value={officer.title}
                    onChange={(e) => onChange(id, 'title', e.target.value)}
                    className="mt-1 w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2.5 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                >
                    {officerTitles.map(title => <option key={title} value={title}>{title}</option>)}
                </select>
            </div>
            <div className="col-span-6 sm:col-span-3 flex items-center h-11">
                <div className="flex items-center">
                    <input
                        id={`${id}-proTem`}
                        type="checkbox"
                        checked={officer.isProTem}
                        onChange={(e) => onChange(id, 'isProTem', e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor={`${id}-proTem`} className="ml-2 block text-sm text-slate-300">
                        Pro Tem
                    </label>
                </div>
            </div>
        </div>
    );
};


const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; required?: boolean; }> = ({ label, id, type = 'text', ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-amber-300 mb-1">{label}</label>
        <input
            id={id}
            type={type}
            className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            {...props}
        />
    </div>
);


export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, brothersList, onAddBrother }) => {
  const [details, setDetails] = useState<MeetingDetails>({
    lodgeName: '',
    lodgeNumber: '',
    meetingDate: new Date().toISOString().split('T')[0],
    meetingTime: '19:30',
    meetingType: 'Stated Communication',
    minuteTemplate: 'Standard Communication',
    degree: 'third',
    brethrenPresent: '',
    worshipfulMaster: { name: '', title: 'Brother', isProTem: false },
    seniorWarden: { name: '', title: 'Brother', isProTem: false },
    juniorWarden: { name: '', title: 'Brother', isProTem: false },
    treasurer: { name: '', title: 'Brother', isProTem: false },
    secretary: { name: '', title: 'Brother', isProTem: false },
    seniorDeacon: { name: '', title: 'Brother', isProTem: false },
    juniorDeacon: { name: '', title: 'Brother', isProTem: false },
    steward1: { name: '', title: 'Brother', isProTem: false },
    steward2: { name: '', title: 'Brother', isProTem: false },
    tyler: { name: '', title: 'Brother', isProTem: false },
  });
  const [notes, setNotes] = useState<string>('');

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleOfficerChange = (
    officerKey: keyof Omit<MeetingDetails, 'lodgeName' | 'lodgeNumber' | 'meetingDate' | 'meetingTime' | 'meetingType' | 'minuteTemplate' | 'degree' | 'brethrenPresent'>,
    field: keyof Officer,
    value: string | boolean
  ) => {
    setDetails(prev => ({
      ...prev,
      [officerKey]: {
        ...prev[officerKey],
        [field]: value
      }
    }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(details, notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Lodge Name" id="lodgeName" value={details.lodgeName} onChange={handleDetailChange} placeholder="e.g., Harmony" required />
        <InputField label="Lodge Number" id="lodgeNumber" value={details.lodgeNumber} onChange={handleDetailChange} placeholder="e.g., 17" required />
        <div>
           <label htmlFor="meetingDate" className="block text-sm font-medium text-amber-300 mb-1">Meeting Date</label>
           <input type="date" id="meetingDate" value={details.meetingDate} onChange={handleDetailChange} required className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" />
        </div>
        <div>
           <label htmlFor="meetingTime" className="block text-sm font-medium text-amber-300 mb-1">Meeting Time</label>
           <input type="time" id="meetingTime" value={details.meetingTime} onChange={handleDetailChange} required className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" />
        </div>
        <div>
            <label htmlFor="meetingType" className="block text-sm font-medium text-amber-300 mb-1">Meeting Type</label>
            <select
                id="meetingType"
                value={details.meetingType}
                onChange={handleDetailChange}
                required
                className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2.5 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            >
                <option value="Stated Communication">Stated Communication</option>
                <option value="Special Communication">Special Communication</option>
                <option value="Installation Meeting">Installation Meeting</option>
                <option value="Entered Apprentice Degree">Entered Apprentice Degree</option>
                <option value="Fellow Craft Degree">Fellow Craft Degree</option>
                <option value="Master Mason Degree">Master Mason Degree</option>
            </select>
        </div>
        <div>
            <label htmlFor="minuteTemplate" className="block text-sm font-medium text-amber-300 mb-1">Minute Template</label>
            <select
                id="minuteTemplate"
                value={details.minuteTemplate}
                onChange={handleDetailChange}
                required
                className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2.5 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            >
                <option value="Standard Communication">Standard Communication</option>
                <option value="Installation Meeting">Installation Meeting</option>
                <option value="Degree Ceremony">Degree Ceremony</option>
            </select>
        </div>
        <div>
            <label htmlFor="degree" className="block text-sm font-medium text-amber-300 mb-1">Degree (Opening & Closing)</label>
            <select
                id="degree"
                value={details.degree}
                onChange={handleDetailChange}
                required
                className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2.5 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            >
                <option value="third">Master Mason (Third Degree)</option>
                <option value="second">Fellow Craft (Second Degree)</option>
                <option value="first">Entered Apprentice (First Degree)</option>
            </select>
        </div>
        <div>
            <InputField label="Number of Brethren Present" id="brethrenPresent" value={details.brethrenPresent} onChange={handleDetailChange} type="number" placeholder="e.g., 25" />
        </div>
      </div>

      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-xl font-bold text-amber-400 mb-4">Principal Officers</h3>
        <div className="space-y-4">
            <OfficerInputGroup label="Worshipful Master" id="worshipfulMaster" officer={details.worshipfulMaster} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="W.Bro. John Smith" required />
            <OfficerInputGroup label="Senior Warden" id="seniorWarden" officer={details.seniorWarden} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="Bro. Robert Jones" />
            <OfficerInputGroup label="Junior Warden" id="juniorWarden" officer={details.juniorWarden} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="Bro. Charles Miller" />
            <OfficerInputGroup label="Treasurer" id="treasurer" officer={details.treasurer} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="W.Bro. David Wilson" />
            <OfficerInputGroup label="Secretary" id="secretary" officer={details.secretary} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="W.Bro. James Brown" />
            <OfficerInputGroup label="Senior Deacon" id="seniorDeacon" officer={details.seniorDeacon} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="Bro. Michael Davis" />
            <OfficerInputGroup label="Junior Deacon" id="juniorDeacon" officer={details.juniorDeacon} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="Bro. William Garcia" />
            <OfficerInputGroup label="Steward 1" id="steward1" officer={details.steward1} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="Bro. Richard Martinez" />
            <OfficerInputGroup label="Steward 2" id="steward2" officer={details.steward2} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="Bro. Joseph Hernandez" />
            <OfficerInputGroup label="Tyler" id="tyler" officer={details.tyler} onChange={handleOfficerChange} brothersList={brothersList} onAddBrother={onAddBrother} placeholder="Bro. Thomas Moore" />
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <label htmlFor="notes" className="block text-sm font-medium text-amber-300 mb-1">Shorthand Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={handleNotesChange}
          placeholder="e.g., Opening, read last minutes - approved. Pet. from Mr. Doe read. Bro. X gave report on charity. Balloted on Mr. Y - clear. Closed."
          required
          rows={15}
          className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition flex-grow"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading ? (
            <>
                <Loader />
                Generating...
            </>
        ) : (
          'Generate Minutes'
        )}
      </button>
    </form>
  );
};