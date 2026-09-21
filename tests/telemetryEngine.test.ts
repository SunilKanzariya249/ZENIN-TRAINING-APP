import { describe, it, expect } from 'vitest';
import { weatherService, mapWmoWeatherCode } from '../src/services/weatherService';

describe('WeatherService & Meteorological Intelligence', () => {
  it('correctly maps WMO 0 (Clear Sky) for day and night', () => {
    const dayClear = mapWmoWeatherCode(0, true);
    expect(dayClear.condition).toBe('Clear Sky');
    expect(dayClear.iconName).toBe('Sun');
    expect(dayClear.fieldStatus).toBe('OPTIMAL');

    const nightClear = mapWmoWeatherCode(0, false);
    expect(nightClear.condition).toBe('Clear Night');
    expect(nightClear.iconName).toBe('Moon');
    expect(nightClear.fieldStatus).toBe('OPTIMAL');
  });

  it('correctly maps cloudy and overcast codes', () => {
    const partlyCloudy = mapWmoWeatherCode(1, true);
    expect(partlyCloudy.condition).toBe('Partly Cloudy');

    const overcast = mapWmoWeatherCode(3, true);
    expect(overcast.condition).toBe('Overcast');
    expect(overcast.iconName).toBe('Cloud');
  });

  it('correctly maps hazardous weather conditions', () => {
    const storm = mapWmoWeatherCode(95, true);
    expect(storm.condition).toBe('Thunderstorm');
    expect(storm.fieldStatus).toBe('HAZARDOUS');

    const heavyRain = mapWmoWeatherCode(65, true);
    expect(heavyRain.condition).toBe('Heavy Rain');
  });

  it('formats temperature in Celsius and Fahrenheit accurately', () => {
    // 25°C in Celsius -> 25°C
    expect(weatherService.formatTemperature(25, 'celsius')).toBe('25°C');

    // 25°C in Fahrenheit: 25 * 9/5 + 32 = 77°F
    expect(weatherService.formatTemperature(25, 'fahrenheit')).toBe('77°F');

    // 0°C in Fahrenheit: 32°F
    expect(weatherService.formatTemperature(0, 'fahrenheit')).toBe('32°F');
  });
});

