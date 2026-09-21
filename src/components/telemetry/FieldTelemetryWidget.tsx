import React, { useState, useEffect } from 'react';
import { weatherService, mapWmoWeatherCode } from '../../services/weatherService';
import { useAppStore } from '../../store/useAppStore';
import { WeatherMetrics } from '../../types';
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
  Compass,
} from 'lucide-react';

export const FieldTelemetryWidget: React.FC = () => {
  const { settings } = useAppStore();
  const [weather, setWeather] = useState<WeatherMetrics | null>(weatherService.getCachedMetrics());
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Subscribe to live Weather updates
  useEffect(() => {
    const unsubWeather = weatherService.onWeatherChange((metrics) => {
      setWeather(metrics);
      setWeatherError(null);
    });

    // Initial weather sync if no cache
    if (!weather) {
      handleRefreshWeather(false);
    }

    return () => {
      unsubWeather();
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Widget Header Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={13} color="var(--accent-cyan)" />
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
            ATMOSPHERIC TELEMETRY & WEATHER
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            GPS SATELLITE SYNC
          </span>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: weather ? '#10B981' : '#F59E0B',
              boxShadow: weather ? '0 0 6px #10B981' : '0 0 6px #F59E0B',
            }}
          />
        </div>
      </div>

      {/* REALTIME WEATHER & ATMOSPHERIC METRICS CARD */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 16px',
          background: 'linear-gradient(135deg, rgba(14, 22, 38, 0.9) 0%, rgba(10, 15, 28, 0.95) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.22)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Row: Location & Refresh Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '80%' }}>
            <MapPin size={13} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={weather ? `${weather.city}, ${weather.region}` : 'Detecting GPS coordinates...'}
            >
              {weather ? `${weather.city}${weather.region ? `, ${weather.region}` : ''}` : 'Detecting GPS Coordinates...'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleRefreshWeather(true)}
            disabled={weatherLoading}
            title="Refresh Live Meteorological Data"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 8px',
              color: 'var(--accent-cyan)',
              cursor: weatherLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <RefreshCw size={11} className={weatherLoading ? 'animate-spin' : ''} />
            <span>{weatherLoading ? 'SYNCING' : 'REFRESH'}</span>
          </button>
        </div>

        {/* Center: Temperature & Weather Details */}
        {weather ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '32px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {displayTemp}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Feels like {displayFeelsLike}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: conditionInfo?.color || 'var(--accent-cyan)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {weather.condition}
                </div>
              </div>

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {renderWeatherIcon(conditionInfo?.iconName, weather.isDay, 28)}
              </div>
            </div>

            {/* Atmospheric Sub-stats (Humidity, Wind, Condition Status) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Droplets size={12} color="#38BDF8" />
                <span>{weather.humidity}% Hum</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wind size={12} color="#94A3B8" />
                <span>{weather.windSpeed} km/h</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: conditionInfo?.color || 'var(--accent-cyan)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {conditionInfo?.fieldStatus || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '14px 0', textAlign: 'center' }}>
            {weatherError ? (
              <div>
                <div style={{ fontSize: '11px', color: '#FCA5A5', marginBottom: '8px' }}>{weatherError}</div>
                <button
                  type="button"
                  onClick={() => handleRefreshWeather(true)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid var(--accent-cyan)',
                    color: 'var(--accent-cyan)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  SYNC GPS WEATHER
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={20} className="animate-spin" color="var(--accent-cyan)" />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Acquiring Satellite Lock & Live Telemetry...
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
