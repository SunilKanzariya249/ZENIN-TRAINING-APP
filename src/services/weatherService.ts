import { WeatherMetrics } from '../types';

export interface WeatherConditionInfo {
  condition: string;
  description: string;
  iconName: 'Sun' | 'Moon' | 'CloudSun' | 'CloudMoon' | 'Cloud' | 'CloudFog' | 'CloudDrizzle' | 'CloudRain' | 'Snowflake' | 'CloudLightning';
  color: string;
  fieldStatus: 'OPTIMAL' | 'CAUTION' | 'HAZARDOUS';
}

const CACHE_KEY = 'zenin_weather_cache';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function mapWmoWeatherCode(code: number, isDay = true): WeatherConditionInfo {
  // Clear sky
  if (code === 0) {
    return {
      condition: isDay ? 'Clear Sky' : 'Clear Night',
      description: isDay ? 'Optimal Hunter field visibility' : 'Clear cosmic sky',
      iconName: isDay ? 'Sun' : 'Moon',
      color: isDay ? '#F59E0B' : '#38BDF8',
      fieldStatus: 'OPTIMAL',
    };
  }
  // Mainly clear, partly cloudy, overcast
  if (code === 1 || code === 2) {
    return {
      condition: 'Partly Cloudy',
      description: 'Scattered atmospheric cloud cover',
      iconName: isDay ? 'CloudSun' : 'CloudMoon',
      color: '#38BDF8',
      fieldStatus: 'OPTIMAL',
    };
  }
  if (code === 3) {
    return {
      condition: 'Overcast',
      description: 'Heavy atmospheric veil detected',
      iconName: 'Cloud',
      color: '#94A3B8',
      fieldStatus: 'OPTIMAL',
    };
  }
  // Fog and depositing rime fog
  if (code === 45 || code === 48) {
    return {
      condition: 'Dense Fog',
      description: 'Reduced optical reconnaissance range',
      iconName: 'CloudFog',
      color: '#94A3B8',
      fieldStatus: 'CAUTION',
    };
  }
  // Drizzle
  if (code >= 51 && code <= 57) {
    return {
      condition: 'Light Drizzle',
      description: 'Minor atmospheric precipitation',
      iconName: 'CloudDrizzle',
      color: '#60A5FA',
      fieldStatus: 'OPTIMAL',
    };
  }
  // Rain
  if (code >= 61 && code <= 67) {
    return {
      condition: code >= 65 ? 'Heavy Rain' : 'Rain',
      description: 'Tactical precipitation in effect',
      iconName: 'CloudRain',
      color: '#3B82F6',
      fieldStatus: 'CAUTION',
    };
  }
  // Snow fall
  if (code >= 71 && code <= 77) {
    return {
      condition: 'Snow Fall',
      description: 'Sub-zero cryo crystallization',
      iconName: 'Snowflake',
      color: '#06B6D4',
      fieldStatus: 'CAUTION',
    };
  }
  // Rain showers
  if (code >= 80 && code <= 82) {
    return {
      condition: 'Rain Showers',
      description: 'Periodic torrential downpour',
      iconName: 'CloudRain',
      color: '#2563EB',
      fieldStatus: 'CAUTION',
    };
  }
  // Snow showers
  if (code === 85 || code === 86) {
    return {
      condition: 'Snow Showers',
      description: 'Severe freezing precipitation',
      iconName: 'Snowflake',
      color: '#BAE6FD',
      fieldStatus: 'HAZARDOUS',
    };
  }
  // Thunderstorm
  if (code >= 95) {
    return {
      condition: 'Thunderstorm',
      description: 'High voltage electrical surge alert',
      iconName: 'CloudLightning',
      color: '#EF4444',
      fieldStatus: 'HAZARDOUS',
    };
  }

  return {
    condition: 'Atmospheric Variance',
    description: 'Ambient tactical weather',
    iconName: 'Cloud',
    color: '#38BDF8',
    fieldStatus: 'OPTIMAL',
  };
}

class WeatherService {
  private currentMetrics: WeatherMetrics | null = null;
  private isFetching = false;
  private listeners: ((metrics: WeatherMetrics) => void)[] = [];

  constructor() {
    this.loadFromCache();
  }

  private loadFromCache(): void {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.data && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          this.currentMetrics = parsed.data;
        }
      }
    } catch (err) {
      console.warn('Weather cache parse error:', err);
    }
  }

  private saveToCache(metrics: WeatherMetrics): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: metrics,
        })
      );
    } catch (err) {
      console.warn('Weather cache save error:', err);
    }
  }

  public getCachedMetrics(): WeatherMetrics | null {
    if (!this.currentMetrics) {
      this.loadFromCache();
    }
    return this.currentMetrics;
  }

  public onWeatherChange(cb: (metrics: WeatherMetrics) => void): () => void {
    this.listeners.push(cb);
    if (this.currentMetrics) {
      cb(this.currentMetrics);
    }
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners(metrics: WeatherMetrics): void {
    this.currentMetrics = metrics;
    this.listeners.forEach((cb) => {
      try {
        cb(metrics);
      } catch (err) {
        console.error('Weather listener error:', err);
      }
    });
  }

  /**
   * Fetches the user's real GPS coordinates via navigator.geolocation.
   */
  public async getUserCoordinates(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your device or browser.'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let message = 'Unable to retrieve location coordinates.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location access permission was denied. Please allow location access.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location signal currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out.';
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 300000,
        }
      );
    });
  }

  /**
   * Reverse geocodes coordinates to find the user's real City, State/Region, and Country.
   */
  public async reverseGeocode(lat: number, lon: number): Promise<{ city: string; region: string; country: string }> {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const city =
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          data.lookupSource ||
          'Local Sector';
        const region = data.principalSubdivision || data.countryCode || '';
        const country = data.countryName || '';
        return { city, region, country };
      }
    } catch (err) {
      console.warn('Reverse geocoding network fallback:', err);
    }

    // Secondary fallback using Open-Meteo or generic coordinate label
    return {
      city: `${lat.toFixed(2)}°N`,
      region: `${lon.toFixed(2)}°E`,
      country: 'Global Grid',
    };
  }

  /**
   * Fetches real-time, accurate meteorological data using Open-Meteo.
   */
  public async fetchRealtimeWeather(forceRefresh = false): Promise<{ success: boolean; data?: WeatherMetrics; error?: string }> {
    if (this.isFetching) {
      if (this.currentMetrics) return { success: true, data: this.currentMetrics };
    }

    if (!forceRefresh && this.currentMetrics) {
      return { success: true, data: this.currentMetrics };
    }

    this.isFetching = true;

    try {
      // 1. Get real location coordinates
      const coords = await this.getUserCoordinates();

      // 2. Fetch Open-Meteo current weather and reverse geocoding in parallel
      const weatherPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`
      ).then((res) => {
        if (!res.ok) throw new Error(`Meteorological API responded with HTTP ${res.status}`);
        return res.json();
      });

      const geocodePromise = this.reverseGeocode(coords.latitude, coords.longitude);

      const [weatherData, geoData] = await Promise.all([weatherPromise, geocodePromise]);

      const current = weatherData.current;
      if (!current) {
        throw new Error('Weather payload missing current metrics.');
      }

      const weatherCode = Number(current.weather_code ?? 0);
      const isDay = current.is_day === 1;
      const conditionInfo = mapWmoWeatherCode(weatherCode, isDay);

      const metrics: WeatherMetrics = {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m ?? 50),
        windSpeed: Math.round(current.wind_speed_10m ?? 0),
        weatherCode,
        condition: conditionInfo.condition,
        description: conditionInfo.description,
        city: geoData.city,
        region: geoData.region,
        country: geoData.country,
        isDay,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      this.saveToCache(metrics);
      this.notifyListeners(metrics);
      this.isFetching = false;

      return { success: true, data: metrics };
    } catch (err: any) {
      this.isFetching = false;
      return {
        success: false,
        error: err.message || 'Failed to sync atmospheric metrics.',
      };
    }
  }

  /**
   * Helper to format temperature based on user settings
   */
  public formatTemperature(tempCelsius: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string {
    if (unit === 'fahrenheit') {
      const f = Math.round((tempCelsius * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${tempCelsius}°C`;
  }
}

export const weatherService = new WeatherService();
