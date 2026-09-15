import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Priority, RecurrenceRule, Subtask } from '../../types';
import { PRIORITIES } from '../../constants/priorities';
import { CategoryIcon } from '../../assets/icons';
import { format } from 'date-fns';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Repeat,
  Tag,
  Check,
  Zap,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export const CreateMissionModal: React.FC = () => {
  const {
    createMissionOpen,
    editingMissionId,
    missions,
    categories,
    setCreateMissionOpen,
    addMission,
    updateMission,
  } = useAppStore();

  const editingMission = editingMissionId ? missions.find((m) => m.id === editingMissionId) : null;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('COMMON');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState('18:00');
  const [reminderTime, setReminderTime] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [customXp, setCustomXp] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate when editing or opening
  useEffect(() => {
    if (editingMission) {
      setTitle(editingMission.title);
      setDescription(editingMission.description || '');
      setPriority(editingMission.priority);
      setCategoryId(editingMission.categoryId);
      setDueDate(editingMission.dueDate || format(new Date(), 'yyyy-MM-dd'));
      setDueTime(editingMission.dueTime || '18:00');
      setReminderTime(editingMission.reminderTime || '');
      setRecurrence(editingMission.recurrence);
      setEstimatedDuration(editingMission.estimatedDuration || 30);
      setCustomXp(editingMission.customXp ? editingMission.xpReward : undefined);
      setTags(editingMission.tags || []);
      setSubtasks(editingMission.subtasks || []);
    } else {
      // Reset form defaults
      setTitle('');
      setDescription('');
      setPriority('COMMON');
      setCategoryId(categories[0]?.id || 'cat-work');
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
      setDueTime('18:00');
      setReminderTime('');
      setRecurrence('none');
      setEstimatedDuration(30);
      setCustomXp(undefined);
      setTags([]);
      setSubtasks([]);
    }
    setErrorMsg('');
  }, [editingMission, createMissionOpen, categories]);

  if (!createMissionOpen) return null;

  const currentXpReward = customXp || PRIORITIES[priority].defaultXp + subtasks.length * 10;

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    const newSt: Subtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: subtaskInput.trim(),
      completed: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };
    setSubtasks([...subtasks, newSt]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Mission Title is strictly required by the System.');
      return;
    }

    if (reminderTime && dueTime && reminderTime > dueTime && dueDate === format(new Date(), 'yyyy-MM-dd')) {
      setErrorMsg('Reminder alert cannot be scheduled after the deadline.');
      return;
    }

    if (editingMission) {
      updateMission(editingMission.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        categoryId: categoryId || categories[0]?.id || 'cat-work',
        dueDate,
        dueTime,
        reminderTime: reminderTime || undefined,
        recurrence,
        estimatedDuration,
        xpReward: currentXpReward,
        customXp: !!customXp,
        tags,
        subtasks,
      });
    } else {
      addMission({
        title: title.trim(),
        description: description.trim(),
        priority,
        categoryId: categoryId || categories[0]?.id || 'cat-work',
        dueDate,
        dueTime,
        reminderTime: reminderTime || undefined,
        recurrence,
        estimatedDuration,
        xpReward: currentXpReward,
        customXp: !!customXp,
        tags,
        subtasks,
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 9, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={() => setCreateMissionOpen(false)}
    >
      <div
        className="screen-fade-in"
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '92vh',
          backgroundColor: '#0A0E17',
          borderTop: '2px solid var(--accent-violet)',
          borderLeft: '1px solid rgba(139, 92, 246, 0.3)',
          borderRight: '1px solid rgba(139, 92, 246, 0.3)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '20px',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.1em',
                fontWeight: 700,
              }}
            >
              [DIRECTIVE PROTOCOL]
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                color: '#FFFFFF',
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginTop: '2px',
              }}
            >
              {editingMission ? 'CALIBRATE MISSION' : 'INITIALIZE MISSION'}
            </h2>
          </div>

          <button
            onClick={() => setCreateMissionOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              padding: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#FCA5A5',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertTriangle size={15} color="#EF4444" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 1. Title */}
          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              MISSION OBJECTIVE TITLE *
            </label>
            <input
              type="text"
              placeholder="e.g. Complete System Architecture Blueprint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
              autoFocus
            />
          </div>

          {/* 2. Priority Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                PRIORITY TIER
              </label>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                REWARD: +{currentXpReward} XP
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as Priority[]).map((p) => {
                const config = PRIORITIES[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      background: isSelected ? config.badgeBg : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? `2px solid ${config.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? config.textColor : 'var(--text-muted)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      boxShadow: isSelected ? `0 0 12px ${config.glowColor}` : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{p}</span>
                    <span style={{ fontSize: '9px', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>
                      +{config.defaultXp}XP
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Category Selector */}
          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              DOMAIN / CATEGORY
            </label>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: isSelected ? `${c.color}25` : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? `1px solid ${c.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    <CategoryIcon name={c.icon} size={12} color={isSelected ? c.color : 'currentColor'} />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Due Date, Due Time & Recurrence */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                DEADLINE DATE
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                }}
              >
                <Calendar size={14} color="var(--accent-cyan)" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                TIME
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                }}
              >
                <Clock size={14} color="var(--accent-violet)" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recurrence Selector */}
          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              RECURRENCE PROTOCOL
            </label>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {[
                { id: 'none', label: 'None' },
                { id: 'daily', label: 'Daily' },
                { id: 'weekdays', label: 'Weekdays' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRecurrence(r.id as RecurrenceRule)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    background: recurrence === r.id ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.04)',
                    border: 'none',
                    color: recurrence === r.id ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Subtasks Builder */}
          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              SUBTASKS / CHECKPOINTS ({subtasks.length})
            </label>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Add granular checkpoint..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(139, 92, 246, 0.25)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: '8px',
                  color: 'var(--accent-violet)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            {subtasks.map((st) => (
              <div
                key={st.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{st.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* 6. Tags */}
          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              TAGS
            </label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="e.g. urgent, backend, sprint"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(6, 182, 212, 0.2)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '8px',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: 'var(--accent-violet)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    style={{ background: 'transparent', border: 'none', color: 'currentColor', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 7. Description / Notes */}
          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              BRIEFING DETAILS / PROTOCOL NOTES
            </label>
            <textarea
              rows={3}
              placeholder="Additional mission context, requirements, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* Submit / Cancel Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setCreateMissionOpen(false)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              ABORT
            </button>

            <button
              type="submit"
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 60%, #A855F7 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '13px',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>{editingMission ? 'COMMIT CALIBRATION' : 'AUTHORIZE MISSION'}</span>
              <Zap size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
