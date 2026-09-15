import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SwipeableMissionCard } from '../../components/missions/SwipeableMissionCard';
import { Priority, Priority as PriorityType } from '../../types';
import { format, isPast, isToday, isFuture, parseISO } from 'date-fns';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Archive,
  Star,
  X,
} from 'lucide-react';

type FilterTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'favorites' | 'archived';
type SortOption = 'newest' | 'oldest' | 'deadline' | 'priority' | 'xp' | 'title';

export const MissionsScreen: React.FC = () => {
  const {
    missions,
    categories,
    completeMission,
    deleteMission,
    toggleFavorite,
    setInspectingMissionId,
    setCreateMissionOpen,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filter and Sort Pipeline
  const filteredMissions = useMemo(() => {
    return missions
      .filter((mission) => {
        // Tab Filtering
        if (activeTab === 'archived') {
          if (!mission.archived) return false;
        } else {
          if (mission.archived) return false;

          if (activeTab === 'today') {
            if (mission.dueDate !== todayStr) return false;
          } else if (activeTab === 'upcoming') {
            if (!mission.dueDate || mission.status === 'completed') return false;
            try {
              const d = parseISO(mission.dueDate);
              if (!isFuture(d) || isToday(d)) return false;
            } catch {
              return false;
            }
          } else if (activeTab === 'overdue') {
            if (!mission.dueDate || mission.status === 'completed') return false;
            try {
              const d = parseISO(mission.dueDate);
              if (!isPast(d) || isToday(d)) return false;
            } catch {
              return false;
            }
          } else if (activeTab === 'completed') {
            if (mission.status !== 'completed') return false;
          } else if (activeTab === 'favorites') {
            if (!mission.favorite) return false;
          }
        }

        // Category Filter
        if (selectedCategory !== 'all' && mission.categoryId !== selectedCategory) {
          return false;
        }

        // Priority Filter
        if (selectedPriority !== 'all' && mission.priority !== selectedPriority) {
          return false;
        }

        // Search Filter (Title, Description, Tags, Category Name)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const cat = categories.find((c) => c.id === mission.categoryId);
          const titleMatch = mission.title.toLowerCase().includes(q);
          const descMatch = mission.description?.toLowerCase().includes(q);
          const tagsMatch = mission.tags?.some((t) => t.toLowerCase().includes(q));
          const catMatch = cat?.name.toLowerCase().includes(q);

          if (!titleMatch && !descMatch && !tagsMatch && !catMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'deadline': {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
          }
          case 'priority': {
            const weights: Record<PriorityType, number> = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 };
            return weights[b.priority] - weights[a.priority];
          }
          case 'xp':
            return b.xpReward - a.xpReward;
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [missions, activeTab, selectedCategory, selectedPriority, searchQuery, sortBy, todayStr, categories]);

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'all', label: 'ALL', count: missions.filter((m) => !m.archived).length },
    { id: 'today', label: 'TODAY', count: missions.filter((m) => !m.archived && m.dueDate === todayStr).length },
    {
      id: 'upcoming',
      label: 'UPCOMING',
      count: missions.filter((m) => {
        if (m.archived || !m.dueDate || m.status === 'completed') return false;
        try {
          return isFuture(parseISO(m.dueDate)) && !isToday(parseISO(m.dueDate));
        } catch {
          return false;
        }
      }).length,
    },
    {
      id: 'overdue',
      label: 'OVERDUE',
      count: missions.filter((m) => {
        if (m.archived || !m.dueDate || m.status === 'completed') return false;
        try {
          return isPast(parseISO(m.dueDate)) && !isToday(parseISO(m.dueDate));
        } catch {
          return false;
        }
      }).length,
    },
    { id: 'completed', label: 'CLEARED', count: missions.filter((m) => !m.archived && m.status === 'completed').length },
    { id: 'favorites', label: 'FAVORITES', count: missions.filter((m) => !m.archived && m.favorite).length },
    { id: 'archived', label: 'ARCHIVED', count: missions.filter((m) => m.archived).length },
  ];

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }} className="screen-fade-in">
      {/* Search and Filter Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 22, 35, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '8px 12px',
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search objectives, tags, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          style={{
            padding: '10px',
            borderRadius: '12px',
            background:
              selectedCategory !== 'all' || selectedPriority !== 'all'
                ? 'var(--accent-violet)'
                : 'rgba(16, 22, 35, 0.8)',
            border: '1px solid var(--border-subtle)',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Expanded Filter & Sort Row */}
      {showFilterDrawer && (
        <div
          className="glass-panel screen-fade-in"
          style={{
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'rgba(12, 17, 28, 0.95)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Category Dropdown */}
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                CATEGORY
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  padding: '6px 8px',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value="all" style={{ background: '#0B0F19' }}>All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: '#0B0F19' }}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                PRIORITY TIER
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  padding: '6px 8px',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value="all" style={{ background: '#0B0F19' }}>All Tiers</option>
                <option value="COMMON" style={{ background: '#0B0F19' }}>COMMON</option>
                <option value="RARE" style={{ background: '#0B0F19' }}>RARE</option>
                <option value="EPIC" style={{ background: '#0B0F19' }}>EPIC</option>
                <option value="LEGENDARY" style={{ background: '#0B0F19' }}>LEGENDARY</option>
              </select>
            </div>
          </div>

          {/* Sort selector */}
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              SORT BY
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'newest', label: 'Newest' },
                { id: 'deadline', label: 'Deadline' },
                { id: 'priority', label: 'Priority' },
                { id: 'xp', label: 'XP Reward' },
                { id: 'title', label: 'Alphabetical' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as SortOption)}
                  style={{
                    background: sortBy === s.id ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    color: sortBy === s.id ? '#FFFFFF' : 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs Scrollbar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                background: isActive ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1px solid var(--accent-violet)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '11px',
                fontFamily: 'var(--font-heading)',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 0 12px var(--accent-violet-glow)' : undefined,
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mission List */}
      <div>
        {filteredMissions.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            <Sparkles size={36} color="var(--accent-violet)" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '16px',
                color: '#FFFFFF',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              NO OBJECTIVES FOUND
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              The current filter parameters yielded zero active missions in the system.
            </p>
            <button
              onClick={() => setCreateMissionOpen(true)}
              style={{
                marginTop: '16px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'var(--accent-violet)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={15} />
              <span>INITIALIZE MISSION</span>
            </button>
          </div>
        ) : (
          filteredMissions.map((mission) => {
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
    </div>
  );
};
