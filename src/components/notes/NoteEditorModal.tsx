import React, { useState, useEffect } from 'react';
import { Note, NoteCategory, NoteColor } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import {
  X,
  Save,
  Pin,
  Tag,
  Trash2,
  List,
  CheckSquare,
  Heading,
  Code,
  FileText,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface NoteEditorModalProps {
  note?: Note | null;
  onClose: () => void;
}

const CATEGORIES: { id: NoteCategory; label: string; color: string }[] = [
  { id: 'INTEL', label: 'SYS // INTEL', color: 'var(--accent-cyan)' },
  { id: 'TACTICAL', label: 'TAC // TACTICAL', color: 'var(--accent-violet)' },
  { id: 'TRAINING', label: 'PHY // TRAINING', color: '#10B981' },
  { id: 'PERSONAL', label: 'ARC // ARCHIVE', color: 'var(--accent-gold)' },
];

const COLORS: { id: NoteColor; label: string; hex: string }[] = [
  { id: 'cyan', label: 'Neon Cyan', hex: '#06B6D4' },
  { id: 'violet', label: 'Phantom Violet', hex: '#8B5CF6' },
  { id: 'emerald', label: 'Bio Emerald', hex: '#10B981' },
  { id: 'amber', label: 'Overdrive Amber', hex: '#F59E0B' },
  { id: 'rose', label: 'Crimson Protocol', hex: '#F43F5E' },
];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ note, onClose }) => {
  const { addNote, updateNote, deleteNote } = useAppStore();

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState<NoteCategory>(note?.category || 'INTEL');
  const [color, setColor] = useState<NoteColor>(note?.color || 'cyan');
  const [pinned, setPinned] = useState(note?.pinned || false);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setColor(note.color);
      setPinned(note.pinned);
      setTags(note.tags || []);
    }
  }, [note]);

  const handleAddTag = () => {
    const cleaned = tagInput.trim().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
      setTagInput('');
      soundService.playClick();
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
    soundService.playClick();
  };

  const handleInsertSnippet = (snippet: string) => {
    setContent((prev) => (prev ? `${prev}\n${snippet}` : snippet));
    soundService.playClick();
    hapticService.light();
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg('Protocol identifier (title) is required.');
      hapticService.medium();
      return;
    }

    if (note?.id) {
      updateNote(note.id, {
        title: title.trim(),
        content: content.trim(),
        category,
        color,
        pinned,
        tags,
      });
    } else {
      addNote({
        title: title.trim(),
        content: content.trim(),
        category,
        color,
        pinned,
        tags,
      });
    }

    soundService.playClick();
    hapticService.success();
    onClose();
  };

  const handleDelete = () => {
    if (note?.id) {
      deleteNote(note.id);
      onClose();
    }
  };

  const activeColorHex = COLORS.find((c) => c.id === color)?.hex || '#06B6D4';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#05070B',
        zIndex: 160,
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
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              {note ? 'EDIT TACTICAL LOG' : 'NEW INTEL DIRECTIVE'}
            </h2>
            <div style={{ fontSize: '10px', color: activeColorHex, fontFamily: 'var(--font-mono)' }}>
              {note ? '// RECORD UPDATE PROTOCOL' : '// ENCRYPTED MEMO ENTRY'}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            background: `linear-gradient(135deg, ${activeColorHex}, #3B82F6)`,
            border: 'none',
            borderRadius: '8px',
            padding: '7px 14px',
            color: '#FFFFFF',
            fontSize: '11px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: `0 0 12px ${activeColorHex}60`,
          }}
        >
          <Save size={14} />
          <span>COMMIT</span>
        </button>
      </div>

      {/* Form Body */}
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
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: '8px',
              color: '#F43F5E',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Title Input */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            PROTOCOL IDENTIFIER (TITLE) *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="e.g., Monarch Core Strategy, 10km Conditioning..."
            style={{
              width: '100%',
              backgroundColor: 'rgba(16, 22, 35, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = activeColorHex)}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
            autoFocus
          />
        </div>

        {/* Category & Pin Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                marginBottom: '6px',
              }}
            >
              LOG CLASSIFICATION
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    soundService.playClick();
                  }}
                  style={{
                    padding: '8px 6px',
                    borderRadius: '6px',
                    backgroundColor: category === c.id ? `${c.color}22` : 'rgba(16, 22, 35, 0.6)',
                    border: `1px solid ${category === c.id ? c.color : 'rgba(255, 255, 255, 0.08)'}`,
                    color: category === c.id ? c.color : 'var(--text-muted)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                marginBottom: '6px',
              }}
            >
              PIN TO TOP
            </label>
            <button
              type="button"
              onClick={() => {
                setPinned(!pinned);
                soundService.playClick();
                hapticService.light();
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: pinned ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 22, 35, 0.6)',
                border: `1px solid ${pinned ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)'}`,
                color: pinned ? '#F59E0B' : 'var(--text-muted)',
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s',
              }}
            >
              <Pin size={14} fill={pinned ? '#F59E0B' : 'transparent'} />
              <span>{pinned ? 'PINNED' : 'PIN TO TOP'}</span>
            </button>
          </div>
        </div>

        {/* Color Palette Selector */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            COLOR DIRECTIVE ACCENT
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              backgroundColor: 'rgba(16, 22, 35, 0.6)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setColor(c.id);
                  soundService.playClick();
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: c.hex,
                  border: color === c.id ? '2px solid #FFFFFF' : 'none',
                  boxShadow: color === c.id ? `0 0 10px ${c.hex}` : 'none',
                  cursor: 'pointer',
                  transform: color === c.id ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.15s',
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Content Snippet Quick Insert Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
              }}
            >
              INTEL BODY DETAILS
            </label>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {content.length} chars
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            {[
              { label: 'H2', icon: <Heading size={12} />, snippet: '## ' },
              { label: 'Check', icon: <CheckSquare size={12} />, snippet: '- [ ] ' },
              { label: 'Bullet', icon: <List size={12} />, snippet: '• ' },
              { label: 'Code', icon: <Code size={12} />, snippet: '```\n\n```' },
            ].map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSnippet(btn.snippet)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Record tactical intelligence, coordinates, training schedule, battle notes..."
            rows={9}
            style={{
              width: '100%',
              backgroundColor: 'rgba(16, 22, 35, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#F1F5F9',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              lineHeight: '1.6',
              outline: 'none',
              resize: 'vertical',
              minHeight: '160px',
            }}
            onFocus={(e) => (e.target.style.borderColor = activeColorHex)}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
          />
        </div>

        {/* Tags */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            TACTICAL TAGS
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Type tag & press Enter (e.g. boss, solo, daily)..."
              style={{
                flex: 1,
                backgroundColor: 'rgba(16, 22, 35, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ADD
            </button>
          </div>

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tags.map((t) => (
                <span
                  key={t}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: `${activeColorHex}18`,
                    border: `1px solid ${activeColorHex}40`,
                    color: activeColorHex,
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: activeColorHex,
                      cursor: 'pointer',
                      fontSize: '13px',
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Delete Record Section */}
        {note?.id && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            {!showConfirmDelete ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#F43F5E',
                  fontSize: '11px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={13} />
                <span>PURGE LOG FROM ARCHIVES</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    backgroundColor: '#E11D48',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  CONFIRM PURGE
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
