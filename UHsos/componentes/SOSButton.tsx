import React from 'react';
import { PhoneIcon } from '@heroicons/react/24/solid';

interface SOSButtonProps {
  phoneNumber: string;
  highwayName: string;
  disabled?: boolean;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ phoneNumber, highwayName, disabled }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-500">
      <a
        href={`tel:${phoneNumber}`}
        className={`relative group flex items-center justify-center w-48 h-48 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-[0_0_50px_rgba(239,68,68,0.4)] border-4 border-red-400 active:scale-95 transition-transform ${disabled ? 'opacity-50 pointer-events-none grayscale' : 'pulse-ring'}`}
      >
        <PhoneIcon className="h-20 w-20 text-white drop-shadow-md" />
      </a>
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-3xl font-bold text-white leading-tight">Llamar a Asistencia</h2>
        <p className="text-xl text-red-300 font-medium">{highwayName}</p>
        <div className="inline-block bg-gray-800 px-4 py-1 rounded-full mt-2">
          <span className="font-mono text-xl font-bold text-white tracking-wider">{phoneNumber}</span>
        </div>
      </div>
    </div>
  );
};