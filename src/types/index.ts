// User and authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  language: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    village?: string;
    district?: string;
    state?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Farm and land types
export interface Farm {
  id: string;
  userId: string;
  name: string;
  area: number; // in acres
  soilType: 'clay' | 'loam' | 'sandy' | 'silt' | 'peat' | 'chalk';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  crops: Crop[];
  sensors: IoTDevice[];
  irrigationSystems: IrrigationSystem[];
  createdAt: Date;
  updatedAt: Date;
}

// Crop types
export interface Crop {
  id: string;
  farmId: string;
  name: string;
  variety: string;
  plantedDate: Date;
  expectedHarvestDate: Date;
  area: number; // in acres
  stage: 'seeded' | 'germinated' | 'vegetative' | 'flowering' | 'fruiting' | 'mature' | 'harvested';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// IoT Device types
export interface IoTDevice {
  id: string;
  farmId: string;
  name: string;
  type: 'soil_sensor' | 'weather_station' | 'camera' | 'moisture_sensor' | 'ph_sensor' | 'temperature_sensor';
  status: 'online' | 'offline' | 'maintenance';
  location: {
    latitude: number;
    longitude: number;
    description: string;
  };
  lastReading?: SensorReading;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Sensor reading types
export interface SensorReading {
  id: string;
  deviceId: string;
  timestamp: Date;
  data: {
    soilMoisture?: number; // percentage
    soilPH?: number;
    soilTemperature?: number; // celsius
    airTemperature?: number; // celsius
    humidity?: number; // percentage
    lightIntensity?: number; // lux
    nutrients?: {
      nitrogen?: number;
      phosphorus?: number;
      potassium?: number;
    };
  };
  aiAnalysis?: {
    recommendations: string[];
    alertLevel: 'low' | 'medium' | 'high' | 'critical';
    actions: string[];
  };
}

// Irrigation system types
export interface IrrigationSystem {
  id: string;
  farmId: string;
  name: string;
  type: 'drip' | 'sprinkler' | 'flood' | 'furrow';
  zones: IrrigationZone[];
  autoMode: boolean;
  schedule?: IrrigationSchedule[];
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface IrrigationZone {
  id: string;
  name: string;
  cropId: string;
  area: number;
  isActive: boolean;
  lastWatered?: Date;
  waterUsed?: number; // liters
}

export interface IrrigationSchedule {
  id: string;
  zoneId: string;
  startTime: string; // HH:mm format
  duration: number; // minutes
  frequency: 'daily' | 'weekly' | 'custom';
  days?: number[]; // 0-6 for Sunday-Saturday
  isActive: boolean;
}

// Weather types
export interface WeatherData {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    description: string;
    icon: string;
  };
  forecast: WeatherForecast[];
  timestamp: Date;
  aiAnalysis?: {
    recommendations: string[];
    farmingAdvice: string[];
    warnings: string[];
  };
}

export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
}

// Market analysis types
export interface MarketData {
  id: string;
  location: string;
  crops: CropMarketPrice[];
  trends: MarketTrend[];
  timestamp: Date;
  aiAnalysis?: {
    recommendations: string[];
    profitablecrops: string[];
    marketOutlook: string;
  };
}

export interface CropMarketPrice {
  cropName: string;
  variety?: string;
  currentPrice: number; // per kg
  previousPrice: number;
  priceChange: number; // percentage
  demand: 'low' | 'medium' | 'high';
  supply: 'low' | 'medium' | 'high';
  quality: string[];
}

export interface MarketTrend {
  cropName: string;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number; // percentage
  timeframe: '1week' | '1month' | '3months' | '6months';
}

// AI Analysis types
export interface AIAnalysis {
  id: string;
  userId: string;
  farmId: string;
  type: 'weekly' | 'monthly' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  analysis: {
    cropHealth: string;
    soilCondition: string;
    weatherImpact: string;
    marketOpportunities: string;
    recommendations: string[];
    actionItems: string[];
    riskAssessment: string;
  };
  language: string;
  createdAt: Date;
}

// Chat types
export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  language: string;
  context?: {
    farmId?: string;
    cropId?: string;
    deviceId?: string;
  };
  timestamp: Date;
}

// App state types
export interface AppState {
  user: User | null;
  selectedFarm: Farm | null;
  language: string;
  isLoading: boolean;
  error: string | null;
}
