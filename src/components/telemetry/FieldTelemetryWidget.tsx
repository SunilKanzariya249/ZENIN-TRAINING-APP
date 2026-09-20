import React, { useState, useEffect } from 'react';
import { weatherService, mapWmoWeatherCode } from '../../services/weatherService';
import { stepCounterService } from '../../services/stepCounterService';
import { useAppStore } from '../../store/useAppStore';
import { WeatherMetrics, StepMetrics } from '../../types';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import {
  MapPin,
  RefreshCw,
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Footprints,
  Flame,
  Activity,
  ChevronRight,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { StepHistoryModal } from './StepHistoryModal';

export const FieldTelemetryWidget: React.FC = () => {
  const { settings, setCreateMissionOpen } = useAppStore();
  const [weather, setWeather] = useState<WeatherMetrics | null>(weatherService.getCachedMetrics());
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [steps, setSteps] = useState<StepMetrics>(stepCounterService.getMetrics());
  const [stepPulse, setStepPulse] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Subscribe to live Weather & Step updates
  useEffect(() => {
    const unsubWeather = weatherService.onWeatherChange((metrics) => {
      setWeather(metrics);
      setWeatherError(null);
    });

    const unsubSteps = stepCounterService.onMetricsChange((metrics) => {
      setSteps(metrics);
      setStepPulse(true);
      const timer = setTimeout(() => setStepPulse(false), 300);
      return () => clearTimeout(timer);
    });

    // Initial weather sync if no cache
    if (!weather) {
      handleRefreshWeather(false);
    }

    return () => {
      unsubWeather();
      unsubSteps();
    };
  }, []);

  const handleRefreshWeather = async (force = true) => {
    setWeatherLoading(true);
    setWeatherError(null);
    soundService.playClick();
    hapticService.light();

    const res = await weatherService.fetchRealtimeWeather(force);
    setWeatherLoading(false);

    if (!res.success) {
      setWeatherError(res.error || 'Failed to detect location weather.');
    } else if (res.data) {
      setWeather(res.data);
    }
  };

  const handleStartSensor = async () => {
    soundService.playClick();
    hapticService.medium();
    const ok = await stepCounterService.startSensor();
    if (!ok) {
      // Simulate/add manual testing steps if hardware sensor unavailable
      stepCounterService.addManualSteps(250);
    }
  };

  // Weather Icon Component
  const renderWeatherIcon = (iconName?: string, isDay = true, size = 26) => {
    switch (iconName) {
      case 'Sun':
        return <Sun size={size} color="#F59E0B" className="animate-spin-slow" />;
      case 'Moon':
        return <Moon size={size} color="#38BDF8" />;
      case 'CloudSun':
        return <CloudSun size={size} color="#38BDF8" />;
      case 'CloudMoon':
        return <CloudMoon size={size} color="#818CF8" />;
      case 'CloudFog':
        return <CloudFog size={size} color="#94A3B8" />;
      case 'CloudDrizzle':
        return <CloudDrizzle size={size} color="#60A5FA" />;
      case 'CloudRain':
        return <CloudRain size={size} color="#3B82F6" />;
      case 'Snowflake':
        return <Snowflake size={size} color="#06B6D4" />;
      case 'CloudLightning':
        return <CloudLightning size={size} color="#EF4444" />;
      case 'Cloud':
      default:
        return isDay ? <CloudSun size={size} color="#38BDF8" /> : <CloudMoon size={size} color="#818CF8" />;
    }
  };

  const conditionInfo = weather ? mapWmoWeatherCode(weather.weatherCode, weather.isDay) : null;
  const tempUnit = settings.temperatureUnit || 'celsius';
  const displayTemp = weather ? weatherService.formatTemperature(weather.temperature, tempUnit) : '--°';
  const displayFeelsLike = weather ? weatherService.formatTemperature(weather.feelsLike, tempUnit) : '--°';

  const stepPercent = Math.min(100, Math.round((steps.steps / Math.max(1, steps.goal)) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Widget Header Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={13} color="var(--accent-cyan)" />
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: 'var(--accent-cyan)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            FIELD TELEMETRY & SENSORS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            LIVE SYNC
          </span>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: steps.isSensorActive ? '#10B981' : '#F59E0B',
              boxShadow: steps.isSensorActive ? '0 0 6px #10B981' : '0 0 6px #F59E0B',
            }}
          />
        </div>
      </div>

      {/* 2-Column Telemetry Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
        }}
      >
        {/* ========================================================= */}
        {/* 1. REALTIME WEATHER & ATMOSPHERIC METRICS CARD */}
        {/* ========================================================= */}
        <div
          className="glass-panel"
          style={{
            padding: '12px 14px',
            background: 'linear-gradient(135deg, rgba(14, 22, 38, 0.9) 0%, rgba(10, 15, 28, 0.9) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Row: Location & Refresh Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '80%' }}>
              <MapPin size={11} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={weather ? `${weather.city}, ${weather.region}` : 'Detecting GPS...'}
              >
                {weather ? weather.city : 'GPS Detecting...'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleRefreshWeather(true)}
              disabled={weatherLoading}
              title="Refresh Live Weather"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px',
                color: 'var(--accent-cyan)',
                cursor: weatherLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={11} className={weatherLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Center: Temperature & Weather Icon */}
          {weather ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '26px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {displayTemp}
                  </div>
                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: conditionInfo?.color || 'var(--accent-cyan)',
                      marginTop: '3px',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {weather.condition}
                  </div>
                </div>

                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(0, 240, 255, 0.06)',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {renderWeatherIcon(conditionInfo?.iconName, weather.isDay, 24)}
                </div>
              </div>

              {/* Atmospheric Sub-stats (Humidity & Wind) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Droplets size={10} color="#38BDF8" />
                  <span>{weather.humidity}% Hum</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Wind size={10} color="#94A3B8" />
                  <span>{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '8px 0', textAlign: 'center' }}>
              {weatherError ? (
                <div>
                  <div style={{ fontSize: '10px', color: '#FCA5A5', marginBottom: '6px' }}>{weatherError}</div>
                  <button
                    type="button"
                    onClick={() => handleRefreshWeather(true)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: 'rgba(0, 240, 255, 0.15)',
                      border: '1px solid var(--accent-cyan)',
                      color: 'var(--accent-cyan)',
                      fontSize: '10px',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    SYNC GPS WEATHER
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={16} className="animate-spin" color="var(--accent-cyan)" />
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    Acquiring Satellite Lock...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. REALTIME PHYSICAL PEDOMETER (STEP COUNTER) CARD */}
        {/* ========================================================= */}
        <div
          className="glass-panel"
          onClick={() => {
            setShowHistoryModal(true);
            soundService.playClick();
          }}
          style={{
            padding: '12px 14px',
            background: 'linear-gradient(135deg, rgba(20, 16, 38, 0.9) 0%, rgba(14, 12, 28, 0.9) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          {/* Top Row: Title, Charts Badge & Sensor Status Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Footprints size={12} color="var(--accent-violet)" />
              <span
                style={{
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                STEPS
              </span>
              <span
                style={{
                  fontSize: '8px',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  background: 'rgba(0, 240, 255, 0.1)',
                  padding: '1px 4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span>CHART</span>
                <BarChart3 size={8} />
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartSensor();
              }}
              title={steps.isSensorActive ? 'Sensor tracking active' : 'Click to activate step sensors'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: steps.isSensorActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(139, 92, 246, 0.15)',
                border: `1px solid ${steps.isSensorActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                borderRadius: '6px',
                padding: '2px 6px',
                color: steps.isSensorActive ? '#10B981' : 'var(--accent-violet)',
                fontSize: '8.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: steps.isSensorActive ? '#10B981' : 'var(--accent-violet)',
                }}
              />
              <span>{steps.isSensorActive ? 'TRACKING' : 'ACTIVATE'}</span>
            </button>
          </div>

          {/* Center: Live Step Count & Goal */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '26px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  transition: 'transform 0.15s ease',
                  transform: stepPulse ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {steps.steps.toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                / {steps.goal.toLocaleString()}
              </span>
            </div>

            {/* Step Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '7px',
              }}
            >
              <div
                style={{
                  width: `${stepPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-violet) 0%, var(--accent-cyan) 100%)',
                  borderRadius: '3px',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)',
                }}
              />
            </div>

            {/* Sub-metrics: Distance & Calories */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '9px',
                paddingTop: '7px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '9.5px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: 'var(--accent-violet)', fontWeight: 700 }}>{steps.distanceKm}</span>
                <span>km dist</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Flame size={10} color="#F59E0B" />
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>{steps.caloriesBurned}</span>
                <span>kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Day Step History & Analytics Modal */}
      {showHistoryModal && <StepHistoryModal onClose={() => setShowHistoryModal(false)} />}
    </div>
  );
};
