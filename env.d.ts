declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GEMINI_API_KEY?: string;
      OPENWEATHER_API_KEY?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
    }
  }
}

export {};