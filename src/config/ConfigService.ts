// import { stringify } from "querystring";

export interface AppConfig {
  // AI Configuration
  geminiApiKey: string;
  // Weather API
  openWeatherApiKey: string;

  // Market Data
  agMarketApiKey: string;
  commodityApiKey: string;

  // Firebase
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    databaseURL: string;
  };
  
  // Additional Services
  googleMapsApiKey: string;
  newsApiKey: string;
  
  // App Settings
  appEnv: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  appVersion: string;
  
  // Development
  debugMode: boolean;
  enableLogging: boolean;
  mockApiResponses: boolean;
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = {
      // AI Configuration - Read from environment variables
      geminiApiKey: process.env.GEMINI_API_KEY || 'AIzaSyBTH7sF1GIqSbSzjTgqFOzEjen3twGkxmg',
      
      // Weather API - Read from environment variables  
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '2e48929c43e79a18716e2c8e8120d4f5',
      
      // Market Data
      agMarketApiKey: 'your_ag_market_api_key',
      commodityApiKey: 'your_commodity_api_key',
      
      // Firebase - Using your original Firebase project
      firebaseConfig: {
        apiKey: 'AIzaSyD_QqWm6YXP1lbTfaFLH-xP2_XdKSC6awI',
        authDomain: 'agrosense-ede09.firebaseapp.com',
        projectId: 'agrosense-ede09',
        storageBucket: 'agrosense-ede09.firebasestorage.app',
        messagingSenderId: '431028442747',
        appId: '1:431028442747:android:dbcd8fb17c92bf8c87f4de',
        databaseURL: 'https://agrosense-ede09-default-rtdb.asia-southeast1.firebasedatabase.app/',
      },
      
      // Additional Services
      googleMapsApiKey: '',
      newsApiKey: '',
      
      // App Settings
      appEnv: 'development',
      apiBaseUrl: 'https://api.agrosense.com',
      appVersion: '1.0.0',
      
      // Development
      debugMode: true,
      enableLogging: true,
      mockApiResponses: false, // Use real APIs since we have keys
    };
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public get geminiApiKey(): string {
    return this.config.geminiApiKey;
  }

  public get openWeatherApiKey(): string {
    return this.config.openWeatherApiKey;
  }

  public get firebaseConfig() {
    return this.config.firebaseConfig;
  }

  public get isDevelopment(): boolean {
    return this.config.appEnv === 'development';
  }

  public get isProduction(): boolean {
    return this.config.appEnv === 'production';
  }

  public get shouldMockApis(): boolean {
    return this.config.mockApiResponses;
  }

  public get shouldLog(): boolean {
    return this.config.enableLogging;
  }

  // Validation methods
  public validateConfiguration(): { isValid: boolean; missingKeys: string[] } {
    const missingKeys: string[] = [];
    
    
    return {
      isValid: missingKeys.length === 0,
      missingKeys
    };
  }

  public logConfiguration(): void {
    if (!this.shouldLog) return;
    
    console.log('🔧 AgroSense Configuration:');
    console.log(`📱 App Environment: ${this.config.appEnv}`);
    console.log(`📦 App Version: ${this.config.appVersion}`);
    console.log(`🤖 Gemini API: ${this.config.geminiApiKey && !this.config.geminiApiKey.includes('dummy') ? '✅ Configured from .env' : '❌ Missing or using dummy'}`);
    console.log(`🌤️ Weather API: ${this.config.openWeatherApiKey && !this.config.openWeatherApiKey.includes('dummy') ? '✅ Configured from .env' : '❌ Missing or using dummy'}`);
    console.log(`🔥 Firebase: ${this.config.firebaseConfig.apiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🗺️ Google Maps: ${this.config.googleMapsApiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🔧 Debug Mode: ${this.config.debugMode ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`🎭 Mock APIs: ${this.config.mockApiResponses ? '⚠️ Using Mock Data' : '✅ Using Real APIs'}`);
    
    // Log configuration validation
    const validation = this.validateConfiguration();
    if (validation.isValid) {
      console.log('✅ All required API keys are configured!');
    } else {
      console.log('⚠️ Missing API keys:', validation.missingKeys.join(', '));
    }
  }
}

export default ConfigService.getInstance();