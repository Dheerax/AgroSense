import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ConfigService from '../config/ConfigService';

// Get API key from configuration
const API_KEY = ConfigService.geminiApiKey;
const genAI = new GoogleGenerativeAI(API_KEY);

// Safety settings for agricultural content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export interface CropAnalysisResult {
  diseaseName?: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  treatment: string[];
  prevention: string[];
  urgency: string;
  additionalInfo?: string;
}

export interface AgricultureAdvice {
  recommendation: string;
  reasoning: string;
  actionItems: string[];
  urgency: 'low' | 'medium' | 'high';
  estimatedCost?: string;
  timeframe?: string;
}

export interface WeatherFarmingAdvice {
  todayActions: string[];
  weekAhead: string[];
  seasonalTips: string[];
  riskWarnings: string[];
}

export interface MarketPrediction {
  currentTrend: 'rising' | 'falling' | 'stable';
  prediction: string;
  confidence: number;
  sellingAdvice: string[];
  buyingAdvice: string[];
  marketFactors: string[];
}

class GeminiAIService {
  private model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings 
  });

  private visionModel = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings 
  });

  /**
   * General agricultural chat assistant
   */
  async getAgriculturalAdvice(query: string, context?: {
    location?: string;
    cropType?: string;
    farmSize?: string;
    experience?: string;
    language?: string;
  }): Promise<AgricultureAdvice> {
    try {
      const contextInfo = context ? `
        Location: ${context.location || 'Not specified'}
        Crop Type: ${context.cropType || 'Mixed farming'}
        Farm Size: ${context.farmSize || 'Small scale'}
        Experience: ${context.experience || 'Beginner'}
        Preferred Language: ${context.language || 'English'}
      ` : '';

      const prompt = `
        You are an expert agricultural advisor with deep knowledge of modern farming practices, traditional methods, and sustainable agriculture. 
        Provide practical, actionable advice for farmers in a conversational, easy-to-read format.

        ${contextInfo}

        Query: ${query}

        Please provide a comprehensive, well-formatted response that includes:
        - Clear practical recommendations
        - Brief scientific reasoning
        - Step-by-step action items if applicable
        - Urgency level and timeframe if relevant
        - Cost estimates when helpful

        Write in a natural, conversational tone as if speaking directly to a farmer. 
        Use proper formatting with paragraphs, bullet points, and clear sections.
        Keep language simple and practical. Include both modern and traditional methods when relevant.
        
        DO NOT format as JSON - provide a natural, readable text response.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Return the natural language response directly
      return {
        recommendation: text,
        reasoning: "Expert agricultural guidance based on modern farming practices",
        actionItems: [],
        urgency: 'medium' as const
      };
    } catch (error) {
      console.error('AI Advice Error:', error);
      throw new Error('Unable to get agricultural advice. Please try again.');
    }
  }

  /**
   * Analyze crop photos for diseases, pests, deficiencies
   */
  async analyzeCropPhoto(imageBase64: string, cropType?: string): Promise<CropAnalysisResult> {
    try {
      const prompt = `
        You are an expert plant pathologist and agricultural specialist. Analyze this ${cropType || 'crop'} image for:
        
        1. Disease identification (fungal, bacterial, viral)
        2. Pest damage assessment
        3. Nutrient deficiencies
        4. Growth abnormalities
        5. Overall plant health

        Provide specific diagnosis with:
        - Disease/issue name
        - Severity level (low/medium/high)
        - Confidence percentage
        - Detailed treatment options
        - Prevention strategies
        - Urgency of action needed

        Format as JSON with fields: diseaseName, severity, confidence, treatment, prevention, urgency, additionalInfo
        Be specific about treatments including organic and chemical options.
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        return {
          severity: 'medium' as const,
          confidence: 0.7,
          treatment: [text],
          prevention: ["Regular monitoring recommended"],
          urgency: "Inspect plant regularly and apply recommended treatments"
        };
      }
    } catch (error) {
      console.error('Crop Analysis Error:', error);
      throw new Error('Unable to analyze crop image. Please try again.');
    }
  }

  /**
   * Weather-based farming recommendations
   */
  async getWeatherFarmingAdvice(weatherData: {
    current: { temp: number; humidity: number; condition: string };
    forecast: Array<{ date: string; temp: number; humidity: number; condition: string; precipitation?: number }>;
    location: string;
  }, cropTypes: string[]): Promise<WeatherFarmingAdvice> {
    try {
      const prompt = `
        You are an agricultural meteorologist. Based on this weather data, provide farming advice:

        Location: ${weatherData.location}
        Current Weather: ${weatherData.current.temp}°C, ${weatherData.current.humidity}% humidity, ${weatherData.current.condition}
        
        7-Day Forecast:
        ${weatherData.forecast.map(day => 
          `${day.date}: ${day.temp}°C, ${day.humidity}% humidity, ${day.condition}${day.precipitation ? `, ${day.precipitation}mm rain` : ''}`
        ).join('\n')}

        Crops: ${cropTypes.join(', ')}

        Provide practical advice for:
        1. Actions to take today
        2. Planning for the week ahead
        3. Seasonal tips based on weather patterns
        4. Risk warnings (frost, drought, flooding, etc.)

        Format as JSON with fields: todayActions, weekAhead, seasonalTips, riskWarnings
        Focus on actionable, practical advice for farmers.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        return {
          todayActions: ["Monitor weather conditions"],
          weekAhead: ["Plan activities based on forecast"],
          seasonalTips: ["Follow seasonal best practices"],
          riskWarnings: ["Stay updated with weather alerts"]
        };
      }
    } catch (error) {
      console.error('Weather Advice Error:', error);
      throw new Error('Unable to get weather-based advice. Please try again.');
    }
  }

  /**
   * Market intelligence and pricing predictions
   */
  async getMarketPrediction(commodity: string, currentPrice: number, marketData: {
    historicalPrices: Array<{ date: string; price: number }>;
    volume: number;
    location: string;
  }): Promise<MarketPrediction> {
    try {
      const prompt = `
        You are an agricultural market analyst. Analyze this market data for ${commodity}:

        Current Price: ₹${currentPrice}
        Location: ${marketData.location}
        Trading Volume: ${marketData.volume} tons
        
        Historical Prices (last 30 days):
        ${marketData.historicalPrices.map(p => `${p.date}: ₹${p.price}`).join('\n')}

        Provide market intelligence:
        1. Current trend analysis (rising/falling/stable)
        2. Price prediction for next 2 weeks
        3. Confidence level (0-1)
        4. Selling strategy advice
        5. Buying recommendations for traders
        6. Key market factors affecting prices

        Format as JSON with fields: currentTrend, prediction, confidence, sellingAdvice, buyingAdvice, marketFactors
        Be practical and actionable for farmers and traders.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        return {
          currentTrend: 'stable' as const,
          prediction: "Market analysis suggests stable prices in near term",
          confidence: 0.6,
          sellingAdvice: ["Monitor daily prices before selling"],
          buyingAdvice: ["Consider bulk purchases during price dips"],
          marketFactors: ["Weather conditions", "Seasonal demand", "Transportation costs"]
        };
      }
    } catch (error) {
      console.error('Market Prediction Error:', error);
      throw new Error('Unable to get market predictions. Please try again.');
    }
  }

  /**
   * Multi-language support for farmer queries
   */
  async translateAndAdvise(query: string, sourceLanguage: string, targetLanguage: string = 'English'): Promise<{
    translatedQuery: string;
    advice: AgricultureAdvice;
    translatedAdvice: string;
  }> {
    try {
      const translationPrompt = `
        Translate this agricultural query from ${sourceLanguage} to ${targetLanguage}:
        "${query}"
        
        Provide only the translated text.
      `;

      const translationResult = await this.model.generateContent(translationPrompt);
      const translatedQuery = (await translationResult.response).text();

      const advice = await this.getAgriculturalAdvice(translatedQuery);

      const backTranslationPrompt = `
        Translate this agricultural advice back to ${sourceLanguage}:
        "${advice.recommendation}"
        
        Keep it simple and practical for farmers.
      `;

      const backTranslationResult = await this.model.generateContent(backTranslationPrompt);
      const translatedAdvice = (await backTranslationResult.response).text();

      return {
        translatedQuery,
        advice,
        translatedAdvice
      };
    } catch (error) {
      console.error('Translation Error:', error);
      throw new Error('Unable to translate and provide advice. Please try again.');
    }
  }

  /**
   * Seasonal farming calendar and reminders
   */
  async getSeasonalCalendar(location: string, cropTypes: string[]): Promise<{
    currentSeason: string;
    monthlyTasks: Array<{ month: string; tasks: string[] }>;
    criticalDates: Array<{ date: string; activity: string; importance: 'high' | 'medium' | 'low' }>;
  }> {
    try {
      const prompt = `
        Create a comprehensive farming calendar for ${location} with crops: ${cropTypes.join(', ')}

        Provide:
        1. Current season identification
        2. Monthly farming tasks for the entire year
        3. Critical dates and activities with importance levels

        Consider local climate, monsoon patterns, and crop-specific requirements.
        Format as JSON with fields: currentSeason, monthlyTasks, criticalDates
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        return {
          currentSeason: "Current season",
          monthlyTasks: [{ month: "Current", tasks: ["Regular monitoring and care"] }],
          criticalDates: [{ date: "Ongoing", activity: "Daily farm management", importance: 'medium' as const }]
        };
      }
    } catch (error) {
      console.error('Calendar Error:', error);
      throw new Error('Unable to create seasonal calendar. Please try again.');
    }
  }
}

export default new GeminiAIService();