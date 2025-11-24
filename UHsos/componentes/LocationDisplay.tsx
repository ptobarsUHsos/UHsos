import React, { useState } from 'react';
import { MapPinIcon, ClipboardDocumentIcon, ShareIcon } from '@heroicons/react/24/outline';

interface LocationDisplayProps { lat: number | null; lng: number | null; }

export const LocationDisplay: React.FC<LocationDisplayProps> = ({ lat, lng }) => {
  const [copied, setCopied] = useState(false);
  if (!lat || !lng) return null;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const shareText = `¡Emergencia! Necesito asistencia vial. Ubicación: ${lat}, ${lng}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'UHsos', text: shareText, url: googleMapsUrl }); }
      catch (error) { console.log('Error compartiendo:', error); }
    } else {
      handleCopy(); window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="mt-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex flex-col items-center text-center max-w-sm mx-auto w-full backdrop-blur-sm">
      <div className="flex items-center gap-2 text-gray-400 mb-3 uppercase text-xs font-bold tracking-widest">
        <MapPinIcon className="h-4 w-4" /> Tu Ubicación Exacta
      </div>
      <div className="flex items-center gap-2 w-full max-w-[280px]">
        <div className="flex-1 bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700/50 font-mono text-sm text-blue-300 truncate">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
        <button onClick={handleShare} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"><ShareIcon className="h-5 w-5" /></button>
      </div>
    </div>
  );
};