import { describe, it, expect, beforeEach, vi } from 'vitest';
import { stepCounterService, StepMilestoneAward } from '../src/services/stepCounterService';
import { weatherService, mapWmoWeatherCode } from '../src/services/weatherService';

// Ensure localStorage mock is present in Node environment
if (typeof localStorage === 'undefined') {
  let store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe('StepCounterService Kinetic Pedometer', () => {
  beforeEach(() => {
    localStorage.clear();
    stepCounterService.resetTodaySteps();
    stepCounterService.setDailyGoal(10000);
  });

  it('initializes with default metrics', () => {
    const metrics = stepCounterService.getMetrics();
    expect(metrics.steps).toBe(0);
    expect(metrics.goal).toBe(10000);
    expect(metrics.distanceKm).toBe(0);
    expect(metrics.caloriesBurned).toBe(0);
  });

  it('correctly calculates distance and calories based on human walking cadence', () => {
    // Add 1,000 steps
    stepCounterService.addManualSteps(1000);
    const metrics = stepCounterService.getMetrics();

    expect(metrics.steps).toBe(1000);
    // 1000 * 0.762 / 1000 = 0.76 km
    expect(metrics.distanceKm).toBe(0.76);
    // 1000 * 0.04 = 40 kcal
    expect(metrics.caloriesBurned).toBe(40);
    // 1000 / 100 = 10 active mins
    expect(metrics.activeMinutes).toBe(10);
  });

  it('updates daily goal and recalculates metrics', () => {
    stepCounterService.setDailyGoal(5000);
    expect(stepCounterService.getDailyGoal()).toBe(5000);

    const metrics = stepCounterService.getMetrics();
    expect(metrics.goal).toBe(5000);
  });

  it('triggers milestone awards at 25%, 50%, 75%, and 100% of goal', () => {
    const awardsReceived: StepMilestoneAward[] = [];
    stepCounterService.setOnMilestoneAwarded((award) => {
      awardsReceived.push(award);
    });

    // Goal is 10,000 steps. Add 2,500 steps (25%)
    stepCounterService.addManualSteps(2500);
    expect(awardsReceived.length).toBe(1);
    expect(awardsReceived[0].percent).toBe(25);
    expect(awardsReceived[0].xpReward).toBe(50);

    // Add another 2,500 steps (total 5,000 steps = 50%)
    stepCounterService.addManualSteps(2500);
    expect(awardsReceived.length).toBe(2);
    expect(awardsReceived[1].percent).toBe(50);
    expect(awardsReceived[1].xpReward).toBe(100);

    // Jump to 10,000 steps (100% - should trigger 75% and 100%)
    stepCounterService.addManualSteps(5000);
    expect(awardsReceived.length).toBe(4);
    expect(awardsReceived[2].percent).toBe(75);
    expect(awardsReceived[3].percent).toBe(100);
    expect(awardsReceived[3].xpReward).toBe(300);
  });

  it('does not re-trigger already awarded milestones on same day', () => {
    const awardsReceived: StepMilestoneAward[] = [];
    stepCounterService.setOnMilestoneAwarded((award) => {
      awardsReceived.push(award);
    });

    stepCounterService.addManualSteps(3000); // 25% achieved
    expect(awardsReceived.length).toBe(1);

    stepCounterService.addManualSteps(100); // Still in 25-50% range
    expect(awardsReceived.length).toBe(1); // Should not duplicate
  });
});

describe('WeatherService WMO Atmospheric Interpretation', () => {
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
