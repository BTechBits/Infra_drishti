
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface MaintenanceEvent {
  date: string;
  type: string;
  description: string;
}

export interface EngineeringTelemetry {
  stress: number; // in MPa
  strain: number; // in microns/m
  loadCapacity: number; // in Tons/day or standard load units
  vibrationFrequency: number; // in Hz (Natural frequency)
}

export interface Asset {
  id: string;
  name: string;
  type: 'Bridge' | 'Road' | 'Building' | 'Tunnel' | 'Flyover';
  coordinates: [number, number]; // [lat, lng]
  riskScore: number; // 0-100
  age: number; // years
  lastMaintenance: string; // ISO date
  loadFactor: number; // 0-10
  climateImpact: number; // 0-10
  description: string;
  zone: string;
  timeline: MaintenanceEvent[];
  telemetry: EngineeringTelemetry;
  imageUrl?: string;
}

export interface ScenarioFactors {
  maintenanceGap: number; // years
  trafficIncrease: number; // percentage
  rainfallIntensity: number; // scale 1-10
  heavyVehicleRatio: number; // percentage 0-100
  seismicIntensity: number; // Richter scale 0-10
  materialQuality: number; // 0-1 (1 is perfect)
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
