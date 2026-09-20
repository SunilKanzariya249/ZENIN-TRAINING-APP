import React, { useState, useMemo } from 'react';
import { Note, NoteCategory } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { NoteEditorModal } from './NoteEditorModal';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import {
  X,
  Plus,
  Search,
  Pin,
  FileText,
  Tag,
  Edit3,
  Trash2,
  Database,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_TABS: { id: 'ALL' | NoteCategory; label: string }[] = [
  { id: 'ALL', label: 'ALL LOGS' },
  { id: 'INTEL', label: 'INTEL' },
  { id: 'TACTICAL', label: 'TACTICAL' },
  { id: 'TRAINING', label: 'TRAINING' },
  { id: 'PERSONAL', label: 'ARCHIVE' },
];

const COLOR_ACCENTS: Record<string, { hex: string; glow: string }> = {
  cyan: { hex: '#06B6D4', glow: 'rgba(6, 182, 212, 0.2)' },
  violet: { hex: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.2)' },
  emerald: { hex: '#10B981', glow: 'rgba(16, 185, 129, 0.2)' },
  amber: { hex: '#F59E0B', glow: 'rgba(245, 158, 11, 0.2)' },
  rose: { hex: '#F43F5E', glow: 'rgba(244, 63, 94, 0.2)' },
};

export const NotesModal: React.FC = () => {
  const { notes, setNotesModalOpen, deleteNote, togglePinNote } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | NoteCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEditorNote, setActiveEditorNote] = useState<Note | null | 'new'>(null);

  const filteredNotes = useMemo(() => {
    return (notes || []).filter((note) => {
      const matchesCategory =
        selectedCategory === 'ALL' || note.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        (note.tags && note.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesQuery;
    });
  }, [notes, selectedCategory, searchQuery]);

  const pinnedNotes = useMemo(() => {
    return filteredNotes.filter((n) => n.pinned);
  }, [filteredNotes]);

  const regularNotes = useMemo(() => {
    return filteredNotes.filter((n) => !n.pinned);
  }, [filteredNotes]);

  const formatNoteDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return format(new Date(isoString), 'MMM dd • HH:mm');
    } catch {
      return isoString;
    }
  };

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
      {/* Header */}
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
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <Database size={17} color="#06B6D4" />
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
              HUNTER ARCHIVE LOGS
            </h2>
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {notes.length} RECORD{notes.length === 1 ? '' : 'S'} // ENCRYPTED STORAGE
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              soundService.playClick();
              setActiveEditorNote('new');
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.25)',
            }}
          >
            <Plus size={14} color="#06B6D4" />
            <span>NEW NOTE</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              setNotesModalOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(10, 14, 23, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search directives, tags, keywords..."
            style={{
              width: '100%',
              backgroundColor: 'rgba(16, 22, 35, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '8px 32px 8px 34px',
              color: '#FFFFFF',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id);
                  soundService.playClick();
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 22, 35, 0.6)',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes Grid */}
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
        {filteredNotes.length === 0 ? (
          <div
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <FileText size={22} color="var(--text-muted)" />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
              }}
            >
              {searchQuery ? 'NO MATCHING INTEL' : 'SYSTEM LOGS CLEAR'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '280px' }}>
              {searchQuery
                ? `No directives match "${searchQuery}".`
                : 'Document dungeon strategies, training blueprints, and private codes.'}
            </div>
            <button
              onClick={() => {
                soundService.playClick();
                setActiveEditorNote('new');
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-cyan), #3B82F6)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '11px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              CREATE FIRST DIRECTIVE
            </button>
          </div>
        ) : (
          <>
            {/* Pinned Directives */}
            {pinnedNotes.length > 0 && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--accent-gold)',
                    letterSpacing: '0.06em',
                    marginBottom: '10px',
                  }}
                >
                  <Pin size={13} fill="var(--accent-gold)" />
                  <span>PINNED DIRECTIVES ({pinnedNotes.length})</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      formatDate={formatNoteDate}
                      onEdit={() => setActiveEditorNote(note)}
                      onPin={() => togglePinNote(note.id)}
                      onDelete={() => deleteNote(note.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Archive Directives */}
            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.06em',
                      marginBottom: '10px',
                    }}
                  >
                    <FileText size={13} />
                    <span>ARCHIVE DIRECTIVES ({regularNotes.length})</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                  {regularNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      formatDate={formatNoteDate}
                      onEdit={() => setActiveEditorNote(note)}
                      onPin={() => togglePinNote(note.id)}
                      onDelete={() => deleteNote(note.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Editor Modal Child */}
      {activeEditorNote && (
        <NoteEditorModal
          note={activeEditorNote === 'new' ? null : activeEditorNote}
          onClose={() => setActiveEditorNote(null)}
        />
      )}
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  formatDate: (d?: string) => string;
  onEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, formatDate, onEdit, onPin, onDelete }) => {
  const accent = COLOR_ACCENTS[note.color] || COLOR_ACCENTS.cyan;

  return (
    <div
      onClick={onEdit}
      style={{
        position: 'relative',
        padding: '14px',
        borderRadius: '10px',
        backgroundColor: note.pinned ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 22, 35, 0.75)',
        border: `1px solid ${note.pinned ? 'rgba(245, 158, 11, 0.4)' : `${accent.hex}40`}`,
        boxShadow: `0 0 12px ${note.pinned ? 'rgba(245, 158, 11, 0.15)' : accent.glow}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent.hex)}
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = note.pinned ? 'rgba(245, 158, 11, 0.4)' : `${accent.hex}40`)
      }
    >
      {/* Top Accent Strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: note.pinned ? '#F59E0B' : accent.hex,
        }}
      />

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '9px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: `${accent.hex}20`,
              color: accent.hex,
              border: `1px solid ${accent.hex}40`,
            }}
          >
            {note.category}
          </span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {formatDate(note.updatedAt || note.createdAt)}
          </span>
        </div>

        {/* Quick action buttons */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundService.playClick();
              hapticService.light();
              onPin();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: note.pinned ? '#F59E0B' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
            }}
            title={note.pinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin size={13} fill={note.pinned ? '#F59E0B' : 'transparent'} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundService.playClick();
              onEdit();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Edit"
          >
            <Edit3 size={13} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundService.playClick();
              hapticService.medium();
              onDelete();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h4
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '14px',
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '0.02em',
          marginBottom: '6px',
        }}
      >
        {note.title}
      </h4>

      {/* Content Preview */}
      <p
        style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          marginBottom: '10px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          whiteSpace: 'pre-line',
          fontFamily: 'var(--font-body)',
        }}
      >
        {note.content || '(Empty contents)'}
      </p>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto', paddingTop: '6px' }}>
          {note.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 5px',
                borderRadius: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
