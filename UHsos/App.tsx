import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SOSButton } from './components/SOSButton';
import { LocationDisplay } from './components/LocationDisplay';
import { Loader } from './components/Loader';
import { findRoadsideAssistance } from './services/geminiService';
import { AppState, HighwayAssistanceInfo } from './types';
import { ExclamationTriangleIcon, ArrowPathIcon, WifiIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [info, setInfo] = useState<HighwayAssistanceInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLocateAndAnalyze = useCallback(async () => {
    if (!navigator.onLine) {
      setAppState(AppState.ERROR);
      setErrorMsg("No hay conexión a internet. Verifica tu señal.");
      return;
    }
    setAppState(AppState.LOCATING);
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setAppState(AppState.ERROR);
      setErrorMsg("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setAppState(AppState.ANALYZING);
        try {
          const assistanceData = await findRoadsideAssistance(latitude, longitude);
          setInfo(assistanceData);
          setAppState(AppState.READY);
        } catch (err) {
          setAppState(AppState.ERROR);
          setErrorMsg("Error conectando con el servicio de asistencia inteligente.");
        }
      },
      (err) => {
        setAppState(AppState.ERROR);
        setErrorMsg("No pudimos obtener tu ubicación. Activa el GPS.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  useEffect(() => { handleLocateAndAnalyze(); }, [handleLocateAndAnalyze]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col pb-safe-bottom">
      <div className="safe-top bg-gray-900/90 z-50"></div>
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-8 px-4 w-full max-w-md mx-auto">
        {appState === AppState.LOCATING && <Loader message="Buscando señal GPS..." />}
        {appState === AppState.ANALYZING && <Loader message="Identificando autopista y servicios..." />}
        {appState === AppState.ERROR && (
          <div className="text-center bg-red-900/20 p-6 rounded-2xl border border-red-800 w-full">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Algo salió mal</h2>
            <p className="text-red-200 mb-6">{errorMsg}</p>
            <button onClick={handleLocateAndAnalyze} className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              <ArrowPathIcon className="h-5 w-5" /> Reintentar
            </button>
          </div>
        )}
        {appState === AppState.READY && info && (
          <div className="w-full animate-in fade-in duration-700">
            <SOSButton phoneNumber={info.phoneNumber} highwayName={info.highwayName} />
            <LocationDisplay lat={coords?.lat || 0} lng={coords?.lng || 0} />
            <div className="mt-6 text-center p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
              <h3 className="text-sm font-semibold text-blue-300 mb-1">Detalle de Ubicación</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{info.description}</p>
            </div>
          </div>
        )}
      </main>
      <footer className="text-center p-6 text-[10px] text-gray-600 safe-bottom">
        <p>UHsos utiliza IA. Verifica siempre el número.</p>
      </footer>
    </div>
  );
};
export default App;