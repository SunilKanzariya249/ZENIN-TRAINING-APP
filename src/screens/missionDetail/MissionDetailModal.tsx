import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PriorityBadge } from '../../components/missions/PriorityBadge';
import { CategoryIcon } from '../../assets/icons';
import {
  X,
  Check,
  Edit,
  Copy,
  Archive,
  Trash2,
  Calendar,
  Clock,
  Zap,
  Repeat,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export const MissionDetailModal: React.FC = () => {
  const {
    inspectingMissionId,
    missions,
    categories,
    setInspectingMissionId,
    setCreateMissionOpen,
    completeMission,
    uncompleteMission,
    deleteMission,
    duplicateMission,
    archiveMission,
    restoreMission,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
  } = useAppStore();

  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');

  const mission = inspectingMissionId ? missions.find((m) => m.id === inspectingMissionId) : null;
  if (!mission) return null;

  const category = categories.find((c) => c.id === mission.categoryId);
  const isCompleted = mission.status === 'completed';

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    addSubtask(mission.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 9, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 8999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => setInspectingMissionId(null)}
    >
      <div
        className="glass-panel-glow screen-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          backgroundColor: '#0A0E17',
          padding: '20px',
          borderRadius: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PriorityBadge priority={mission.priority} size="md" />
            {category && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: category.color,
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <CategoryIcon name={category.icon} size={13} color={category.color} />
                {category.name}
              </span>
            )}
          </div>

          <button
            onClick={() => setInspectingMissionId(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Title & XP Banner */}
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '18px',
              fontWeight: 700,
              color: isCompleted ? 'var(--text-muted)' : '#FFFFFF',
              textDecoration: isCompleted ? 'line-through' : 'none',
              lineHeight: 1.3,
            }}
          >
            {mission.title}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
            }}
          >
            <Zap size={15} fill="var(--accent-cyan)" />
            <span>REWARD: +{mission.xpReward} XP</span>
            {mission.xpAwarded && (
              <span style={{ color: '#10B981', fontSize: '11px', marginLeft: '6px' }}>[XP SYNCED]</span>
            )}
          </div>
        </div>

        {/* Description / Mission Briefing */}
        {mission.description && (
          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {mission.description}
          </div>
        )}

        {/* Timeline Metadata Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          {mission.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} color="var(--accent-cyan)" />
              <span>DEADLINE: {mission.dueDate}</span>
            </div>
          )}

          {mission.dueTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="var(--accent-violet)" />
              <span>TIME: {mission.dueTime}</span>
            </div>
          )}

          {mission.recurrence !== 'none' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Repeat size={13} color="#F59E0B" />
              <span>REPEAT: {mission.recurrence.toUpperCase()}</span>
            </div>
          )}

          {mission.completedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', gridColumn: 'span 2' }}>
              <CheckCircle2 size={13} color="#10B981" />
              <span>CLEARED AT: {mission.completedAt}</span>
            </div>
          )}
        </div>

        {/* Subtasks Section */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-muted)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              marginBottom: '8px',
              textTransform: 'uppercase',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>SUBTASKS / CHECKPOINTS</span>
            <span>
              {mission.subtasks.filter((s) => s.completed).length}/{mission.subtasks.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
            {mission.subtasks.map((st) => (
              <div
                key={st.id}
                onClick={() => toggleSubtask(mission.id, st.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: st.completed ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.3)',
                      background: st.completed ? 'var(--accent-cyan)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {st.completed && <Check size={11} color="#000000" strokeWidth={3} />}
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: st.completed ? 'line-through' : 'none',
                    }}
                  >
                    {st.title}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubtask(mission.id, st.id);
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Quick add subtask input */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="Add subtask..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '11px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddSubtask}
              style={{
                padding: '6px 10px',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '6px',
                color: 'var(--accent-violet)',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Tags */}
        {mission.tags && mission.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {mission.tags.map((t, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-violet)',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Primary Action Button (Complete / Restore) */}
        <button
          onClick={() => {
            if (isCompleted) {
              uncompleteMission(mission.id);
            } else {
              completeMission(mission.id);
              setInspectingMissionId(null);
            }
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: isCompleted
              ? 'rgba(255, 255, 255, 0.08)'
              : 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isCompleted ? 'none' : '0 0 16px rgba(139, 92, 246, 0.4)',
          }}
        >
          <Check size={16} />
          <span>{isCompleted ? 'RESTORE TO ACTIVE' : 'CLEAR MISSION (+XP)'}</span>
        </button>

        {/* Action Toolbar: Edit, Duplicate, Archive, Delete */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          <button
            onClick={() => {
              setInspectingMissionId(null);
              setCreateMissionOpen(true, mission.id);
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
            }}
          >
            <Edit size={14} />
            <span>EDIT</span>
          </button>

          <button
            onClick={() => {
              duplicateMission(mission.id);
              setInspectingMissionId(null);
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
            }}
          >
            <Copy size={14} />
            <span>DUPLICATE</span>
          </button>

          <button
            onClick={() => {
              if (mission.archived) {
                restoreMission(mission.id);
              } else {
                archiveMission(mission.id);
              }
              setInspectingMissionId(null);
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
            }}
          >
            <Archive size={14} />
            <span>{mission.archived ? 'UNARCHIVE' : 'ARCHIVE'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Permanently terminate this mission directive?')) {
                deleteMission(mission.id);
              }
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#EF4444',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
            }}
          >
            <Trash2 size={14} />
            <span>TERMINATE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
