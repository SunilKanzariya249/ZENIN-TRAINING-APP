import React, { useState, useEffect } from 'react';
import { stepCounterService, StepHistoryStats } from '../../services/stepCounterService';
import { DailyStepRecord } from '../../types';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import {
  X,
  Footprints,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface StepHistoryModalProps {
  onClose: () => void;
}

export const StepHistoryModal: React.FC<StepHistoryModalProps> = ({ onClose }) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [history, setHistory] = useState<DailyStepRecord[]>([]);
  const [stats, setStats] = useState<StepHistoryStats | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailyStepRecord | null>(null);

  const refreshData = (days: 7 | 14 | 30) => {
    const records = stepCounterService.getHistory(days);
    const calculatedStats = stepCounterService.getHistoryStats(days);
    setHistory(records);
    setStats(calculatedStats);
    // Select today or the last day by default
    if (records.length > 0) {
      setSelectedDay(records[records.length - 1]);
    }
  };

  useEffect(() => {
    refreshData(timeRange);
  }, [timeRange]);

  const handleRangeChange = (range: 7 | 14 | 30) => {
    setTimeRange(range);
    soundService.playClick();
    hapticService.light();
  };

  const maxStepsInHistory = Math.max(...history.map((h) => h.steps), stepCounterService.getDailyGoal(), 1000);
  const goal = stepCounterService.getDailyGoal();
  const goalLineYPercent = Math.min(100, Math.round((goal / maxStepsInHistory) * 100));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#05070B',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
      }}
      className="screen-fade-in"
    >
      {/* Top Header */}
      <div
        style={{
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(5, 7, 11, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <Footprints size={17} color="var(--accent-violet)" />
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              DAILY STEP ANALYTICS
            </h2>
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              PHYSICAL CONDITIONING ARCHIVE
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Step History"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Time Range Selector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {([7, 14, 30] as const).map((r) => {
            const isSelected = timeRange === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRangeChange(r)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid var(--accent-violet)' : 'none',
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                LAST {r} DAYS
              </button>
            );
          })}
        </div>

        {/* 1. Overview Summary Stats Grid */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}
          >
            {/* Daily Average */}
            <div
              className="glass-panel"
              style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.85) 0%, rgba(14, 18, 30, 0.85) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <TrendingUp size={13} color="var(--accent-cyan)" />
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', fontWeight: 700 }}>
                  DAILY AVERAGE
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                {stats.averageSteps.toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                steps / day
              </div>
            </div>

            {/* Goal Hit Rate */}
            <div
              className="glass-panel"
              style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(20, 16, 38, 0.85) 0%, rgba(14, 12, 28, 0.85) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Award size={13} color="var(--accent-violet)" />
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', fontWeight: 700 }}>
                  GOALS CLEARED
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                {stats.goalsMet} / {stats.totalDays}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent-violet)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {Math.round((stats.goalsMet / stats.totalDays) * 100)}% consistency
              </div>
            </div>

            {/* Total Distance */}
            <div
              className="glass-panel"
              style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.85) 0%, rgba(14, 18, 30, 0.85) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Activity size={13} color="#10B981" />
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', fontWeight: 700 }}>
                  TOTAL DISTANCE
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                {stats.totalDistanceKm} <span style={{ fontSize: '12px', fontWeight: 600 }}>km</span>
              </div>
              <div style={{ fontSize: '10px', color: '#10B981', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {stats.totalSteps.toLocaleString()} total steps
              </div>
            </div>

            {/* Total Calories */}
            <div
              className="glass-panel"
              style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(20, 16, 38, 0.85) 0%, rgba(14, 12, 28, 0.85) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Flame size={13} color="#F59E0B" />
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', fontWeight: 700 }}>
                  ENERGY EXPENDED
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                {stats.totalCalories.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 600 }}>kcal</span>
              </div>
              <div style={{ fontSize: '10px', color: '#F59E0B', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {Math.round(stats.totalCalories / stats.totalDays)} kcal / day
              </div>
            </div>
          </div>
        )}

        {/* 2. Interactive Daily Step Bar Chart */}
        <div
          className="glass-panel-glow"
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95) 0%, rgba(20, 15, 38, 0.95) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                DAILY STEP TRAJECTORY
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Target: <strong style={{ color: '#FFFFFF' }}>{goal.toLocaleString()} steps/day</strong>
              </div>
            </div>

            {selectedDay && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {selectedDay.date === stepCounterService.getTodayDateStr() ? 'TODAY' : selectedDay.date}
                </div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                  {selectedDay.steps.toLocaleString()} steps
                </div>
              </div>
            )}
          </div>

          {/* Bar Chart Container */}
          <div
            style={{
              position: 'relative',
              height: '170px',
              paddingTop: '20px',
              paddingBottom: '24px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: timeRange === 30 ? '3px' : timeRange === 14 ? '6px' : '10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Goal threshold dashed line */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${24 + (goalLineYPercent * 126) / 100}px`,
                borderTop: '1px dashed rgba(0, 240, 255, 0.35)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '-13px',
                  fontSize: '8.5px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  opacity: 0.8,
                }}
              >
                GOAL
              </span>
            </div>

            {history.map((day) => {
              const heightPercent = maxStepsInHistory > 0 ? Math.max(4, Math.round((day.steps / maxStepsInHistory) * 100)) : 4;
              const isSelected = selectedDay?.date === day.date;
              const isToday = day.date === stepCounterService.getTodayDateStr();
              const isGoalMet = day.steps >= goal;

              return (
                <div
                  key={day.date}
                  onClick={() => {
                    setSelectedDay(day);
                    soundService.playClick();
                    hapticService.light();
                  }}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  title={`${day.date}: ${day.steps.toLocaleString()} steps`}
                >
                  {/* Step bar */}
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      maxHeight: '126px',
                      borderRadius: '4px 4px 1px 1px',
                      background: isGoalMet
                        ? 'linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)'
                        : isSelected
                        ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 0.7) 100%)'
                        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%)',
                      boxShadow: isGoalMet
                        ? '0 0 10px rgba(0, 240, 255, 0.4)'
                        : isSelected
                        ? '0 0 8px rgba(139, 92, 246, 0.4)'
                        : 'none',
                      border: isSelected ? '1px solid #FFFFFF' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />

                  {/* Date label underneath */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-20px',
                      fontSize: timeRange === 30 ? '7.5px' : '9px',
                      fontFamily: 'var(--font-mono)',
                      color: isToday ? 'var(--accent-cyan)' : isSelected ? '#FFFFFF' : 'var(--text-muted)',
                      fontWeight: isToday || isSelected ? 800 : 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {timeRange === 7
                      ? isToday
                        ? 'TODAY'
                        : format(parseISO(day.date), 'EEE')
                      : isToday
                      ? 'TOD'
                      : format(parseISO(day.date), 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Expanded Details */}
          {selectedDay && (
            <div
              style={{
                marginTop: '14px',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF' }}>
                  {selectedDay.date === stepCounterService.getTodayDateStr()
                    ? `Today (${format(new Date(), 'EEEE, MMMM d')})`
                    : format(parseISO(selectedDay.date), 'EEEE, MMMM d')}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  <span>
                    Distance: <strong style={{ color: 'var(--accent-violet)' }}>{selectedDay.distanceKm} km</strong>
                  </span>
                  <span>
                    Calories: <strong style={{ color: '#F59E0B' }}>{selectedDay.caloriesBurned} kcal</strong>
                  </span>
                </div>
              </div>

              {selectedDay.steps >= goal ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10B981',
                    color: '#10B981',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>CLEARED</span>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {Math.round((selectedDay.steps / goal) * 100)}% of goal
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Detailed Day-by-Day Historical Log List */}
        <div>
          <h3
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.06em',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Calendar size={14} color="var(--accent-cyan)" />
            <span>DAY-BY-DAY STEP LOG ({history.length} DAYS)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...history].reverse().map((day) => {
              const isToday = day.date === stepCounterService.getTodayDateStr();
              const progressPercent = Math.min(100, Math.round((day.steps / goal) * 100));
              const isGoalMet = day.steps >= goal;

              return (
                <div
                  key={day.date}
                  className="glass-panel"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: isToday ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.06)',
                    background: isToday
                      ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 18, 30, 0.9) 100%)'
                      : 'rgba(16, 22, 35, 0.7)',
                  }}
                >
                  {/* Left: Date and Metrics */}
                  <div style={{ flex: 1, marginRight: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 700,
                          color: isToday ? 'var(--accent-cyan)' : '#FFFFFF',
                        }}
                      >
                        {isToday ? 'Today' : format(parseISO(day.date), 'EEE, MMM d')}
                      </span>
                      {isGoalMet && <CheckCircle2 size={12} color="#10B981" />}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span>{day.distanceKm} km</span>
                      <span>•</span>
                      <span>{day.caloriesBurned} kcal</span>
                      <span>•</span>
                      <span>{day.activeMinutes}m active</span>
                    </div>

                    {/* Miniature Progress Bar */}
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginTop: '6px',
                      }}
                    >
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: isGoalMet
                            ? 'linear-gradient(90deg, var(--accent-cyan), #10B981)'
                            : 'var(--accent-violet)',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Right: Step Count vs Goal */}
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '16px',
                        fontWeight: 900,
                        color: isGoalMet ? 'var(--accent-cyan)' : '#FFFFFF',
                        lineHeight: 1,
                      }}
                    >
                      {day.steps.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '3px' }}>
                      / {goal.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
