import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Language configuration
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  pt: 'Português',
  zh: '中文',
  ar: 'العربية',
  sw: 'Kiswahili',
  am: 'አማርኛ',
  ha: 'Hausa',
};

// Default translations - in a real app, these would come from translation files
const translations = {
  en: {
    // Navigation
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    logout: 'Logout',
    
    // Dashboard
    welcome: 'Welcome to AgroSense',
    cropMonitor: 'Crop Monitor',
    weatherForecast: 'Weather Forecast',
    irrigationControl: 'Irrigation Control',
    marketAnalysis: 'Market Analysis',
    analyticsReports: 'Analytics & Reports',
    pushNotifications: 'Notifications',
    
    // Authentication
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    location: 'Location',
    farmSize: 'Farm Size',
    primaryCrop: 'Primary Crop',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    agreeToTerms: 'I agree to the Terms and Conditions',
    
    // Form validation
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email',
    passwordRequired: 'Password is required',
    passwordWeak: 'Password must be at least 8 characters',
    passwordsDontMatch: 'Passwords do not match',
    nameRequired: 'Full name is required',
    phoneRequired: 'Phone number is required',
    locationRequired: 'Location is required',
    mustAgreeToTerms: 'You must agree to the terms and conditions',
    
    // Weather
    temperature: 'Temperature',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    rainfall: 'Rainfall',
    forecast: 'Forecast',
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    
    // Crops
    cropHealth: 'Crop Health',
    plantingDate: 'Planting Date',
    harvestDate: 'Harvest Date',
    expectedYield: 'Expected Yield',
    currentStage: 'Current Stage',
    seedling: 'Seedling',
    vegetative: 'Vegetative',
    flowering: 'Flowering',
    fruiting: 'Fruiting',
    mature: 'Mature',
    
    // Market
    currentPrice: 'Current Price',
    priceChange: 'Price Change',
    marketTrend: 'Market Trend',
    demand: 'Demand',
    supply: 'Supply',
    recommendations: 'Recommendations',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    yes: 'Yes',
    no: 'No',
    
    // AI and Analysis
    aiAnalysis: 'AI Analysis',
    chatBot: 'Chat Bot',
    askQuestion: 'Ask a question...',
    sendMessage: 'Send Message',
    typing: 'AI is typing...',
    
    // IoT and Sensors
    sensors: 'Sensors',
    irrigation: 'Irrigation',
    soilMoisture: 'Soil Moisture',
    soilTemperature: 'Soil Temperature',
    lightIntensity: 'Light Intensity',
    deviceStatus: 'Device Status',
    online: 'Online',
    offline: 'Offline',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    units: 'Units',
    metric: 'Metric',
    imperial: 'Imperial',
    profile: 'Profile',
  },
  
  es: {
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    dashboard: 'Panel de Control',
    logout: 'Cerrar Sesión',
    welcome: 'Bienvenido a AgroSense',
    cropMonitor: 'Monitor de Cultivos',
    weatherForecast: 'Pronóstico del Tiempo',
    irrigationControl: 'Control de Riego',
    marketAnalysis: 'Análisis de Mercado',
    analyticsReports: 'Análisis e Informes',
    notifications: 'Notificaciones',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    fullName: 'Nombre Completo',
    phoneNumber: 'Número de Teléfono',
    location: 'Ubicación',
    farmSize: 'Tamaño de la Granja',
    primaryCrop: 'Cultivo Principal',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    back: 'Atrás',
    next: 'Siguiente',
    done: 'Hecho',
    yes: 'Sí',
    no: 'No',
  },
  
  hi: {
    login: 'लॉगिन',
    register: 'पंजीकरण',
    dashboard: 'डैशबोर्ड',
    logout: 'लॉगआउट',
    welcome: 'AgroSense में आपका स्वागत है',
    cropMonitor: 'फसल निगरानी',
    weatherForecast: 'मौसम पूर्वानुमान',
    irrigationControl: 'सिंचाई नियंत्रण',
    marketAnalysis: 'बाजार विश्लेषण',
    analyticsReports: 'विश्लेषण और रिपोर्ट',
    notifications: 'सूचनाएं',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नंबर',
    location: 'स्थान',
    farmSize: 'खेत का आकार',
    primaryCrop: 'मुख्य फसल',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    warning: 'चेतावनी',
    info: 'जानकारी',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    add: 'जोड़ें',
    back: 'वापस',
    next: 'अगला',
    done: 'पूर्ण',
    yes: 'हां',
    no: 'नहीं',
  },
  
  // Add more languages as needed
  fr: {
    login: 'Connexion',
    register: 'S\'inscrire',
    dashboard: 'Tableau de Bord',
    logout: 'Déconnexion',
    welcome: 'Bienvenue sur AgroSense',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    save: 'Sauvegarder',
    cancel: 'Annuler',
  },
  
  pt: {
    login: 'Entrar',
    register: 'Registrar',
    dashboard: 'Painel',
    logout: 'Sair',
    welcome: 'Bem-vindo ao AgroSense',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    save: 'Salvar',
    cancel: 'Cancelar',
  },
};

export class LocalizationService {
  private static currentLanguage: string = 'en';
  private static fallbackLanguage: string = 'en';
  
  // Initialize localization service
  static async initialize(): Promise<void> {
    try {
      // Get saved language preference
      const savedLanguage = await AsyncStorage.getItem('app_language');
      
      if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
        this.currentLanguage = savedLanguage;
      } else {
        // Auto-detect device language
        const deviceLanguage = this.detectDeviceLanguage();
        this.currentLanguage = deviceLanguage;
        await this.setLanguage(deviceLanguage);
      }
    } catch (error) {
      console.error('Error initializing localization:', error);
      this.currentLanguage = this.fallbackLanguage;
    }
  }
  
  // Detect device language
  static detectDeviceLanguage(): string {
    try {
      const locales = getLocales();
      const deviceLanguages = locales.map(locale => locale.languageCode);
      const supportedLanguageCodes = Object.keys(SUPPORTED_LANGUAGES);
      
      // Find best match using first device language that's supported
      let bestLanguage = supportedLanguageCodes.find(lang => 
        deviceLanguages.includes(lang)
      );
      
      return bestLanguage || this.fallbackLanguage;
    } catch (error) {
      console.error('Error detecting device language:', error);
      return this.fallbackLanguage;
    }
  }
  
  // Set current language
  static async setLanguage(languageCode: string): Promise<void> {
    try {
      if (this.isLanguageSupported(languageCode)) {
        this.currentLanguage = languageCode;
        await AsyncStorage.setItem('app_language', languageCode);
      } else {
        throw new Error(`Language ${languageCode} is not supported`);
      }
    } catch (error) {
      console.error('Error setting language:', error);
      throw error;
    }
  }
  
  // Get current language
  static getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  // Get available languages
  static getAvailableLanguages(): { code: string; name: string }[] {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
      code,
      name,
    }));
  }
  
  // Check if language is supported
  static isLanguageSupported(languageCode: string): boolean {
    return Object.keys(SUPPORTED_LANGUAGES).includes(languageCode);
  }
  
  // Get translation for a key
  static translate(key: string, params?: Record<string, string>): string {
    try {
      const currentTranslations = translations[this.currentLanguage as keyof typeof translations];
      const fallbackTranslations = translations[this.fallbackLanguage as keyof typeof translations];
      
      let translation = currentTranslations?.[key as keyof typeof currentTranslations] as string;
      
      // Fallback to default language if translation not found
      if (!translation) {
        translation = fallbackTranslations?.[key as keyof typeof fallbackTranslations] as string;
      }
      
      // Return key if no translation found
      if (!translation) {
        console.warn(`Translation not found for key: ${key}`);
        return key;
      }
      
      // Replace parameters if provided
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{{${param}}}`, value);
        });
      }
      
      return translation;
    } catch (error) {
      console.error('Error getting translation:', error);
      return key;
    }
  }
  
  // Shorthand for translate
  static readonly t = LocalizationService.translate;
  
  // Get translations for multiple keys
  static getTranslations(keys: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = this.translate(key);
    });
    return result;
  }
  
  // Format number according to locale
  static formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    try {
      const locale = this.getLocaleForFormatting();
      return new Intl.NumberFormat(locale, options).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  }
  
  // Format currency according to locale
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    try {
      const locale = this.getLocaleForFormatting();
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency} ${amount}`;
    }
  }
  
  // Format date according to locale
  static formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
      const locale = this.getLocaleForFormatting();
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toLocaleDateString();
    }
  }
  
  // Get locale string for formatting
  private static getLocaleForFormatting(): string {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      hi: 'hi-IN',
      pt: 'pt-BR',
      zh: 'zh-CN',
      ar: 'ar-SA',
      sw: 'sw-KE',
      am: 'am-ET',
      ha: 'ha-NG',
    };
    
    return localeMap[this.currentLanguage] || 'en-US';
  }
  
  // Get RTL support for language
  static isRTL(languageCode?: string): boolean {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const lang = languageCode || this.currentLanguage;
    return rtlLanguages.includes(lang);
  }
  
  // Load translations from remote source (for future enhancement)
  static async loadRemoteTranslations(languageCode: string): Promise<void> {
    try {
      // This would typically fetch translations from a remote API
      // For now, we'll use the local translations
      console.log(`Loading remote translations for ${languageCode}`);
      // Implementation would go here
    } catch (error) {
      console.error('Error loading remote translations:', error);
    }
  }
  
  // Pluralization support
  static pluralize(key: string, count: number, params?: Record<string, string>): string {
    const pluralKey = count === 1 ? `${key}_one` : `${key}_other`;
    const translation = this.translate(pluralKey, { ...params, count: count.toString() });
    
    // Fallback to base key if plural form not found
    return translation === pluralKey ? this.translate(key, params) : translation;
  }
  
  // Get language direction
  static getLanguageDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }
}
