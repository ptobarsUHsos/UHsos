import React from 'react';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';

export const Header: React.FC = () => {
  return (
    <header className="w-full p-4 flex items-center justify-center border-b border-gray-800 bg-gray-900/90 backdrop-blur fixed top-0 z-50">
      <div className="flex items-center gap-2">
        <ShieldExclamationIcon className="h-8 w-8 text-red-500" />
        <h1 className="text-2xl font-extrabold tracking-tighter text-white">
          UH<span className="text-red-500">sos</span>
        </h1>
      </div>
    </header>
  );
};