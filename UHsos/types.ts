export interface GeoLocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

export interface HighwayAssistanceInfo {
  highwayName: string;
  phoneNumber: string;
  description: string;
  sources?: Array<{ uri: string; title: string }>;
}

export enum AppState {
  IDLE = 'IDLE',
  LOCATING = 'LOCATING',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  ERROR = 'ERROR',
}