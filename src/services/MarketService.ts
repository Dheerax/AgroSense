import { MarketData, CropMarketPrice, MarketTrend } from '../types';

export class MarketService {
  // Mock market data API endpoint (replace with actual market data API)
  private static readonly MARKET_API_BASE = 'https://api.example.com/market';
  
  // Get current crop prices
  static async getCropPrices(cropName: string, location?: string): Promise<{ success: boolean; cropPrice?: CropMarketPrice; error?: string }> {
    try {
      // Mock implementation - replace with actual market data API
      const mockCropPrice: CropMarketPrice = {
        cropName,
        currentPrice: this.generateMockPrice(cropName),
        previousPrice: this.generateMockPrice(cropName) * 0.95,
        priceChange: Math.random() * 20 - 10, // -10% to +10%
        demand: this.generateDemandLevel(),
        supply: this.generateSupplyLevel(),
        quality: ['Grade A', 'Fresh', 'Organic'],
      };

      return { success: true, cropPrice: mockCropPrice };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get market data for a location with multiple crops
  static async getMarketData(location: string, crops: string[]): Promise<{ success: boolean; marketData?: MarketData; error?: string }> {
    try {
      const cropPrices: CropMarketPrice[] = [];
      const trends: MarketTrend[] = [];

      for (const cropName of crops) {
        // Get crop price
        const priceResult = await this.getCropPrices(cropName, location);
        if (priceResult.success && priceResult.cropPrice) {
          cropPrices.push(priceResult.cropPrice);
        }

        // Generate trend
        trends.push({
          cropName,
          trend: this.generateTrend(),
          confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
          timeframe: this.generateTimeframe(),
        });
      }

      const marketData: MarketData = {
        id: `market_${Date.now()}`,
        location,
        crops: cropPrices,
        trends,
        timestamp: new Date(),
        aiAnalysis: {
          recommendations: this.generateRecommendations(cropPrices),
          profitablecrops: this.getMostProfitableCrops(cropPrices),
          marketOutlook: this.generateMarketOutlook(trends),
        },
      };

      return { success: true, marketData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get market analysis for multiple crops
  static async getMarketAnalysis(crops: string[], location?: string): Promise<{ success: boolean; analysis?: CropMarketPrice[]; error?: string }> {
    try {
      const analysisPromises = crops.map(crop => this.getCropPrices(crop, location));
      const results = await Promise.all(analysisPromises);
      
      const analysis = results
        .filter(result => result.success)
        .map(result => result.cropPrice!)
        .sort((a, b) => b.currentPrice - a.currentPrice);

      return { success: true, analysis };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get price forecast
  static async getPriceForecast(cropName: string, days: number = 7): Promise<{ success: boolean; forecast?: any[]; error?: string }> {
    try {
      const forecast = [];
      const currentPrice = this.generateMockPrice(cropName);
      
      for (let i = 1; i <= days; i++) {
        const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
        const predictedPrice = currentPrice * (1 + variance);
        
        forecast.push({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
          predictedPrice: Math.round(predictedPrice * 100) / 100,
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
          factors: this.generatePriceFactors(),
        });
      }

      return { success: true, forecast };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get best selling opportunities
  static async getBestSellingOpportunities(userCrops: string[], location?: string): Promise<{ success: boolean; opportunities?: any[]; error?: string }> {
    try {
      const marketAnalysis = await this.getMarketAnalysis(userCrops, location);
      
      if (!marketAnalysis.success || !marketAnalysis.analysis) {
        return { success: false, error: 'Failed to fetch market data' };
      }

      const opportunities = marketAnalysis.analysis
        .filter(crop => crop.priceChange > 0 && crop.demand === 'high')
        .map(crop => ({
          cropName: crop.cropName,
          currentPrice: crop.currentPrice,
          recommendedAction: 'SELL',
          urgency: this.calculateUrgency(crop),
          potentialProfit: this.calculatePotentialProfit(crop),
          marketConditions: {
            priceChange: crop.priceChange,
            demand: crop.demand,
            supply: crop.supply,
          },
        }))
        .sort((a, b) => b.potentialProfit - a.potentialProfit);

      return { success: true, opportunities };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Generate market insights
  static async getMarketInsights(cropName: string): Promise<{ success: boolean; insights?: any; error?: string }> {
    try {
      const cropData = await this.getCropPrices(cropName);
      
      if (!cropData.success || !cropData.cropPrice) {
        return { success: false, error: 'Failed to fetch market data' };
      }

      const insights = {
        summary: this.generateMarketSummary(cropData.cropPrice),
        recommendations: this.generateCropRecommendations(cropData.cropPrice),
        riskFactors: this.generateRiskFactors(),
        opportunities: this.generateOpportunities(),
        seasonalTrends: this.generateSeasonalTrends(cropName),
      };

      return { success: true, insights };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Private helper methods for mock data generation
  private static generateMockPrice(cropName: string): number {
    const basePrices: { [key: string]: number } = {
      wheat: 250,
      rice: 180,
      corn: 220,
      soybean: 300,
      cotton: 150,
      tomato: 80,
      potato: 60,
      onion: 40,
      sugarcane: 35,
      coffee: 400,
    };

    const basePrice = basePrices[cropName.toLowerCase()] || 100;
    const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
    return Math.round(basePrice * (1 + variance) * 100) / 100;
  }

  private static generateDemandLevel(): 'low' | 'medium' | 'high' {
    const levels = ['low', 'medium', 'high'];
    return levels[Math.floor(Math.random() * levels.length)] as any;
  }

  private static generateSupplyLevel(): 'low' | 'medium' | 'high' {
    const levels = ['low', 'medium', 'high'];
    return levels[Math.floor(Math.random() * levels.length)] as any;
  }

  private static generateTrend(): 'rising' | 'falling' | 'stable' {
    const trends = ['rising', 'falling', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)] as any;
  }

  private static generateTimeframe(): '1week' | '1month' | '3months' | '6months' {
    const timeframes = ['1week', '1month', '3months', '6months'];
    return timeframes[Math.floor(Math.random() * timeframes.length)] as any;
  }

  private static generatePriceFactors(): string[] {
    const factors = [
      'Weather conditions',
      'Supply chain disruptions',
      'Government policies',
      'Export demand',
      'Storage capacity',
      'Transportation costs',
      'Seasonal variations',
      'Competition from imports',
    ];
    
    return factors.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private static calculateUrgency(crop: CropMarketPrice): 'low' | 'medium' | 'high' {
    if (crop.priceChange > 5 && crop.demand === 'high') return 'high';
    if (crop.priceChange > 0 && crop.demand === 'medium') return 'medium';
    return 'low';
  }

  private static calculatePotentialProfit(crop: CropMarketPrice): number {
    const baseProfit = crop.currentPrice * 0.1; // 10% base profit
    const changeMultiplier = crop.priceChange > 0 ? 1 + (crop.priceChange / 100) : 1;
    const demandMultiplier = crop.demand === 'high' ? 1.3 : crop.demand === 'medium' ? 1.1 : 1;
    
    return Math.round(baseProfit * changeMultiplier * demandMultiplier * 100) / 100;
  }

  private static generateMarketSummary(cropPrice: CropMarketPrice): string {
    const changeDirection = cropPrice.priceChange > 0 ? 'increased' : 'decreased';
    return `Current market conditions for ${cropPrice.cropName} show prices have ${changeDirection} by ${Math.abs(cropPrice.priceChange).toFixed(1)}% with ${cropPrice.demand} demand and ${cropPrice.supply} supply levels.`;
  }

  private static generateRecommendations(crops: CropMarketPrice[]): string[] {
    const recommendations = [];
    
    const risingPriceCrops = crops.filter(crop => crop.priceChange > 0);
    if (risingPriceCrops.length > 0) {
      recommendations.push(`Consider selling ${risingPriceCrops.map(c => c.cropName).join(', ')} as prices are rising`);
    }
    
    const highDemandCrops = crops.filter(crop => crop.demand === 'high');
    if (highDemandCrops.length > 0) {
      recommendations.push(`High demand for ${highDemandCrops.map(c => c.cropName).join(', ')} - excellent selling opportunity`);
    }
    
    recommendations.push('Monitor weather conditions for price impacts');
    recommendations.push('Consider storage costs vs immediate selling');
    
    return recommendations;
  }

  private static generateCropRecommendations(cropPrice: CropMarketPrice): string[] {
    const recommendations = [];
    
    if (cropPrice.priceChange > 0) {
      recommendations.push('Consider selling current stock to maximize profits');
    }
    
    if (cropPrice.demand === 'high' && cropPrice.supply === 'low') {
      recommendations.push('Excellent opportunity for premium pricing');
    }
    
    if (cropPrice.priceChange < 0) {
      recommendations.push('Hold stock and wait for better market conditions');
    }
    
    return recommendations;
  }

  private static getMostProfitableCrops(crops: CropMarketPrice[]): string[] {
    return crops
      .filter(crop => crop.priceChange > 0)
      .sort((a, b) => b.priceChange - a.priceChange)
      .slice(0, 3)
      .map(crop => crop.cropName);
  }

  private static generateMarketOutlook(trends: MarketTrend[]): string {
    const risingTrends = trends.filter(t => t.trend === 'rising').length;
    const totalTrends = trends.length;
    
    if (risingTrends > totalTrends / 2) {
      return 'Market outlook is positive with rising trends in most crops';
    } else if (risingTrends === totalTrends / 2) {
      return 'Market outlook is mixed with balanced trends';
    } else {
      return 'Market outlook requires caution due to falling trends';
    }
  }

  private static generateRiskFactors(): string[] {
    return [
      'Price volatility due to weather conditions',
      'Storage costs during market downturns',
      'Competition from nearby regions',
      'Quality deterioration over time',
    ];
  }

  private static generateOpportunities(): string[] {
    return [
      'Direct sales to processors',
      'Bulk contracts with wholesalers',
      'Value-added processing opportunities',
      'Export market potential',
    ];
  }

  private static generateSeasonalTrends(cropName: string): any {
    return {
      bestSellingMonths: ['March', 'April', 'October'],
      lowestPriceMonths: ['July', 'August'],
      highestDemandSeason: 'Post-harvest',
      averageSeasonalVariation: '15-25%',
    };
  }
}
