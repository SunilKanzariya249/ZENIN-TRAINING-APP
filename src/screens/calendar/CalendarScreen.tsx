import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SwipeableMissionCard } from '../../components/missions/SwipeableMissionCard';
import { PRIORITIES } from '../../constants/priorities';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  List,
  Grid,
} from 'lucide-react';

type CalendarViewMode = 'month' | 'week' | 'agenda';

export const CalendarScreen: React.FC = () => {
  const {
    missions,
    categories,
    completeMission,
    deleteMission,
    toggleFavorite,
    setInspectingMissionId,
    setCreateMissionOpen,
  } = useAppStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Days calculations for Month View
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Days calculations for Week View
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  // Missions for selected date
  const selectedDateMissions = missions.filter(
    (m) => !m.archived && m.dueDate === selectedDateStr
  );

  // Map missions by date for calendar dots
  const missionsByDate: Record<string, typeof missions> = {};
  missions.forEach((m) => {
    if (m.dueDate && !m.archived) {
      if (!missionsByDate[m.dueDate]) missionsByDate[m.dueDate] = [];
      missionsByDate[m.dueDate].push(m);
    }
  });

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }} className="screen-fade-in">
      {/* Calendar Header & View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            [CHRONO RADAR]
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>

        {/* View Mode Buttons */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '2px',
          }}
        >
          {(['month', 'week', 'agenda'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: viewMode === mode ? 'var(--accent-violet)' : 'transparent',
                border: 'none',
                color: viewMode === mode ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '11px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.15s',
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigation & Today quick jump */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => {
            const today = new Date();
            setCurrentDate(today);
            setSelectedDate(today);
          }}
          style={{
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '6px',
            padding: '4px 8px',
            color: 'var(--accent-violet)',
            fontSize: '11px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          TODAY
        </button>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={handlePrev}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 1. MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="glass-panel" style={{ padding: '12px' }}>
          {/* Day of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Month Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {monthDays.map((day, idx) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isSameDay(day, new Date());
              const dayMissions = missionsByDate[dayStr] || [];

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  style={{
                    height: '42px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected
                      ? 'var(--accent-violet)'
                      : isTodayDate
                      ? 'rgba(6, 182, 212, 0.15)'
                      : 'transparent',
                    border: isSelected
                      ? '1px solid var(--accent-violet)'
                      : isTodayDate
                      ? '1px solid rgba(6, 182, 212, 0.4)'
                      : '1px solid transparent',
                    borderRadius: '8px',
                    color: isSelected
                      ? '#FFFFFF'
                      : isCurrentMonth
                      ? 'var(--text-primary)'
                      : 'rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: isSelected || isTodayDate ? 700 : 400 }}>
                    {format(day, 'd')}
                  </span>

                  {/* Priority indicator dots */}
                  {dayMissions.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                      {dayMissions.slice(0, 3).map((m, mIdx) => (
                        <span
                          key={mIdx}
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: PRIORITIES[m.priority]?.color || '#38BDF8',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {weekDays.map((day, idx) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isSameDay(day, new Date());
              const dayMissions = missionsByDate[dayStr] || [];

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  style={{
                    height: '56px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid var(--accent-violet)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: isSelected ? '#FFFFFF' : 'var(--text-muted)' }}>
                    {format(day, 'EEE')}
                  </span>
                  <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: '2px' }}>
                    {format(day, 'd')}
                  </span>

                  {dayMissions.length > 0 && (
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        color: isSelected ? '#FFFFFF' : 'var(--accent-cyan)',
                        marginTop: '2px',
                      }}
                    >
                      {dayMissions.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. AGENDA VIEW (List of all scheduled upcoming dates) */}
      {viewMode === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(missionsByDate)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([dateStr, dateMissions]) => (
              <div key={dateStr} className="glass-panel" style={{ padding: '12px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 700,
                    marginBottom: '8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingBottom: '4px',
                  }}
                >
                  {format(parseISO(dateStr), 'EEEE, MMMM d, yyyy')} ({dateMissions.length} objectives)
                </div>

                {dateMissions.map((m) => {
                  const cat = categories.find((c) => c.id === m.categoryId);
                  return (
                    <SwipeableMissionCard
                      key={m.id}
                      mission={m}
                      category={cat}
                      onComplete={completeMission}
                      onDelete={deleteMission}
                      onToggleFavorite={toggleFavorite}
                      onSelect={(id) => setInspectingMissionId(id)}
                    />
                  );
                })}
              </div>
            ))}
        </div>
      )}

      {/* Selected Date Missions (For Month & Week views) */}
      {viewMode !== 'agenda' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {format(selectedDate, 'EEEE, MMM d')} ({selectedDateMissions.length})
            </div>

            <button
              onClick={() => setCreateMissionOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '11px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} />
              <span>SCHEDULE MISSION</span>
            </button>
          </div>

          {selectedDateMissions.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Sparkles size={24} color="var(--accent-violet)" style={{ margin: '0 auto 6px', opacity: 0.8 }} />
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                No objectives scheduled for this date.
              </div>
            </div>
          ) : (
            selectedDateMissions.map((mission) => {
              const cat = categories.find((c) => c.id === mission.categoryId);
              return (
                <SwipeableMissionCard
                  key={mission.id}
                  mission={mission}
                  category={cat}
                  onComplete={completeMission}
                  onDelete={deleteMission}
                  onToggleFavorite={toggleFavorite}
                  onSelect={(id) => setInspectingMissionId(id)}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
