import React, { useState, useRef } from 'react';
import { Mission, Category } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { CategoryIcon } from '../../assets/icons';
import { Check, Trash2, Star, Clock, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { format, isPast, parseISO, isToday } from 'date-fns';

interface SwipeableMissionCardProps {
  mission: Mission;
  category?: Category;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelect: (id: string) => void;
}

export const SwipeableMissionCard: React.FC<SwipeableMissionCardProps> = ({
  mission,
  category,
  onComplete,
  onDelete,
  onToggleFavorite,
  onSelect,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const subtasks = mission.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const isAllSubtasksDone = subtasks.length > 0 && completedSubtasks === subtasks.length;
  const isCompleted = mission.status === 'completed';

  // Check overdue
  let isOverdue = false;
  if (!isCompleted && mission.dueDate) {
    try {
      const parsed = parseISO(mission.dueDate);
      isOverdue = isPast(parsed) && !isToday(parsed);
    } catch {
      isOverdue = false;
    }
  }

  // Pointer/Touch handling for swipe actions
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwiping) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startXRef.current;
    // Bounded drag: -100px to +100px
    if (Math.abs(diff) < 130) {
      setOffsetX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    if (offsetX > 70 && !isCompleted) {
      // Swiped right -> complete!
      onComplete(mission.id);
    } else if (offsetX < -70) {
      // Swiped left -> delete!
      onDelete(mission.id);
    }
    setOffsetX(0);
  };

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '10px',
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      {/* Background Swipe Actions Indicators */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          borderRadius: '14px',
          background:
            offsetX > 0
              ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, transparent 80%)'
              : 'linear-gradient(270deg, rgba(239, 68, 68, 0.3) 0%, transparent 80%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#10B981',
            fontWeight: 700,
            fontSize: '12px',
            fontFamily: 'var(--font-heading)',
            opacity: offsetX > 30 ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <Check size={18} />
          <span>CLEAR MISSION</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#EF4444',
            fontWeight: 700,
            fontSize: '12px',
            fontFamily: 'var(--font-heading)',
            opacity: offsetX < -30 ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <span>TERMINATE</span>
          <Trash2 size={18} />
        </div>
      </div>

      {/* Main Card Content */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onClick={() => {
          if (Math.abs(offsetX) < 5) {
            onSelect(mission.id);
          }
        }}
        className={isCompleted ? 'glass-panel' : 'glass-panel'}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '14px',
          cursor: 'pointer',
          position: 'relative',
          backgroundColor: isCompleted ? 'rgba(12, 17, 26, 0.6)' : 'rgba(16, 22, 35, 0.85)',
          border: isAllSubtasksDone && !isCompleted
            ? '1px solid rgba(0, 245, 255, 0.4)'
            : isCompleted
            ? '1px solid rgba(255, 255, 255, 0.05)'
            : '1px solid var(--border-subtle)',
          boxShadow: isAllSubtasksDone && !isCompleted ? '0 0 15px -3px rgba(0, 245, 255, 0.25)' : undefined,
          opacity: isCompleted ? 0.65 : 1,
        }}
      >
        {/* Top Meta: Priority, Category, XP & Favorite */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PriorityBadge priority={mission.priority} size="sm" />
            {category && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: category.color,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                }}
              >
                <CategoryIcon name={category.icon} size={12} color={category.color} />
                {category.name}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* XP Award Tag */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: isCompleted ? 'var(--text-muted)' : 'var(--accent-cyan)',
              }}
            >
              +{mission.xpReward} XP
            </span>

            {/* Favorite Star */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(mission.id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: mission.favorite ? '#F59E0B' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Star size={15} fill={mission.favorite ? '#F59E0B' : 'transparent'} />
            </button>
          </div>
        </div>

        {/* Mission Title & Checkbox */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <button
            aria-label="Complete Mission Directive"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(mission.id);
            }}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              background: isCompleted ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.05)',
              border: isCompleted ? '1px solid var(--accent-violet)' : '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginTop: '2px',
              flexShrink: 0,
              boxShadow: isCompleted ? '0 0 10px var(--accent-violet-glow)' : undefined,
              transition: 'all 0.2s',
            }}
          >
            {isCompleted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: isCompleted ? 'line-through' : 'none',
                lineHeight: 1.35,
                wordBreak: 'break-word',
              }}
            >
              {mission.title}
            </h3>

            {mission.description && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {mission.description}
              </p>
            )}
          </div>
        </div>

        {/* Subtask Status & Due Date Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          {/* Subtasks pill */}
          {subtasks.length > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: isAllSubtasksDone ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <CheckCircle2 size={12} color={isAllSubtasksDone ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
              <span>
                {completedSubtasks}/{subtasks.length} Subtasks
              </span>
              {isAllSubtasksDone && !isCompleted && (
                <span style={{ color: 'var(--accent-cyan)', fontSize: '9px', textTransform: 'uppercase' }}>
                  • READY TO CLEAR
                </span>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* Due date / time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
            {mission.dueDate && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: isOverdue ? 'var(--accent-crimson)' : 'var(--text-muted)',
                  fontWeight: isOverdue ? 700 : 400,
                }}
              >
                <Calendar size={11} />
                <span>{mission.dueDate}</span>
              </span>
            )}

            {mission.dueTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={11} />
                <span>{mission.dueTime}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
