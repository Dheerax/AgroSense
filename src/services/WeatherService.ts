import ConfigService from '../config/ConfigService';

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    temp: {
      min: number;
      max: number;
    };
    humidity: number;
    condition: string;
    description: string;
    icon: string;
    precipitation: number;
    windSpeed: number;
  }>;
  location: {
    name: string;
    lat: number;
    lon: number;
    country: string;
  };
}

export class WeatherService {
  private static apiKey = ConfigService.openWeatherApiKey;
  private static baseUrl = 'https://api.openweathermap.org/data/2.5';

  static async getCurrentWeather(latitude: number = 40.7128, longitude: number = -74.0060): Promise<WeatherData | null> {
    try {
      // Check if API key is configured
      if (!this.apiKey || this.apiKey === 'YOUR_OPENWEATHER_API_KEY') {
        console.warn('OpenWeatherMap API key not configured, returning mock data');
        return this.getMockWeatherData();
      }

      // Fetch current weather
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Fetch forecast data
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
      );
      const forecastData = await forecastResponse.json();

      return {
        current: {
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: Math.round(data.wind?.speed || 0),
          windDirection: data.wind?.deg || 0,
          visibility: Math.round((data.visibility || 10000) / 1000),
          uvIndex: 0, // UV index requires separate API call
          condition: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
        },
        location: {
          name: data.name,
          lat: data.coord.lat,
          lon: data.coord.lon,
          country: data.sys.country,
        },
        forecast: this.processForecastData(forecastData.list),
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this.getMockWeatherData();
    }
  }

  private static processForecastData(forecastList: any[]): WeatherData['forecast'] {
    return forecastList.slice(0, 5).map(item => ({
      date: new Date(item.dt * 1000).toISOString().split('T')[0],
      day: new Date(item.dt * 1000).toLocaleDateString('en', { weekday: 'short' }),
      temp: {
        min: Math.round(item.main.temp_min),
        max: Math.round(item.main.temp_max),
      },
      humidity: item.main.humidity,
      condition: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      precipitation: Math.round((item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0)),
      windSpeed: Math.round(item.wind?.speed || 0),
    }));
  }

  private static getMockWeatherData(): WeatherData {
    return {
      current: {
        temp: 25,
        feelsLike: 27,
        humidity: 65,
        pressure: 1013,
        windSpeed: 8,
        windDirection: 180,
        visibility: 10,
        uvIndex: 6,
        condition: 'Clear',
        description: 'clear sky',
        icon: '01d',
      },
      location: {
        name: 'Sample Farm',
        lat: 40.7128,
        lon: -74.0060,
        country: 'US',
      },
      forecast: [
        {
          date: '2024-01-20',
          day: 'Sat',
          temp: { min: 18, max: 28 },
          humidity: 60,
          condition: 'Clear',
          description: 'clear sky',
          icon: '01d',
          precipitation: 0,
          windSpeed: 5,
        },
        {
          date: '2024-01-21',
          day: 'Sun',
          temp: { min: 20, max: 30 },
          humidity: 55,
          condition: 'Clouds',
          description: 'few clouds',
          icon: '02d',
          precipitation: 0,
          windSpeed: 7,
        },
        {
          date: '2024-01-22',
          day: 'Mon',
          temp: { min: 22, max: 32 },
          humidity: 70,
          condition: 'Rain',
          description: 'light rain',
          icon: '10d',
          precipitation: 5,
          windSpeed: 10,
        },
      ],
    };
  }
}

export default WeatherService;
