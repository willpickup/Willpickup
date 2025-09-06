
import React from 'react';

const MasonicSymbol: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21l8-8-4-4 8-8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 3l-8 8 4 4-8 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 shadow-lg shadow-slate-950/50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
        <MasonicSymbol />
        <h1 className="ml-4 text-2xl md:text-3xl font-bold text-slate-100 tracking-wider">
          Masonic Minutes Generator
        </h1>
      </div>
    </header>
  );
};
