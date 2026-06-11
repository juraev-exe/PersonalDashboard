import React, { useMemo } from 'react';
import { usePrayerStore } from '../stores/prayerStore';
import { PrayerName } from '../types';
import { Moon, Star, Check, Flame, Calendar, Info, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';

export default function PrayersPage() {
  const logs = usePrayerStore((s) => s.logs);
  const togglePrayer = usePrayerStore((s) => s.togglePrayer);
  const isPrayerCompleted = usePrayerStore((s) => s.isPrayerCompleted);
  const getDailyCompletion = usePrayerStore((s) => s.getDailyCompletion);
  const streak = usePrayerStore((s) => s.getStreak());

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayProgress = useMemo(() => getDailyCompletion(todayStr), [logs]);

  // Last 7 days helper
  const last7Days = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(subDays(new Date(), i));
    }
    return dates;
  }, []);

  const prayerIcons: Record<PrayerName, string> = {
    [PrayerName.FAJR]: '🌅',
    [PrayerName.DHUHR]: '☀️',
    [PrayerName.ASR]: '🌤️',
    [PrayerName.MAGHRIB]: '🌇',
    [PrayerName.ISHA]: '🌌',
  };

  const prayerDescriptions: Record<PrayerName, string> = {
    [PrayerName.FAJR]: 'Dawn prayer — start your day with focus.',
    [PrayerName.DHUHR]: 'Noon prayer — mid-day reset and mindfulness.',
    [PrayerName.ASR]: 'Afternoon prayer — break up your study session.',
    [PrayerName.MAGHRIB]: 'Sunset prayer — transition to evening reflect.',
    [PrayerName.ISHA]: 'Night prayer — end the day with gratitude.',
  };

  const completedTodayCount = Object.values(PrayerName).filter((p) =>
    isPrayerCompleted(p, todayStr)
  ).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>Prayer Tracker</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Track daily prayer habits, maintain consistency, and earn spiritual streaks.</p>
        </div>
      </div>

      {/* Progress & Streak Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Today's Prayers</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
            {todayProgress === 100 ? "Superb! All 5 prayers completed today! 🌟" : todayProgress > 0 ? "You're doing great, keep going! ☀️" : "Track your prayers to build your daily routines."}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="progress-bar" style={{ height: 10, flex: 1 }}>
              <div className="progress-bar-fill" style={{ width: `${todayProgress}%`, background: 'linear-gradient(90deg, var(--color-accent), var(--color-violet))' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, minWidth: 42, textAlign: 'right' }}>{todayProgress}%</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
          <div style={{ background: 'var(--color-bg-tertiary)', padding: '14px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Completed Today</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {completedTodayCount} <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>/ 5</span>
            </div>
          </div>
          <div style={{ background: 'var(--color-bg-tertiary)', padding: '14px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Current Streak</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Flame size={20} fill="currentColor" />
              {streak}d
            </div>
          </div>
        </div>
      </div>

      {/* Prayers Cards Grid */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Today's Prayers</h3>
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}
        >
          {Object.values(PrayerName).map((prayer) => {
            const completed = isPrayerCompleted(prayer, todayStr);
            return (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                key={prayer}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  justifyContent: 'space-between',
                  borderTop: completed ? '4px solid var(--color-violet)' : '1px solid var(--color-border)',
                  background: completed ? 'rgba(139, 92, 246, 0.05)' : 'var(--color-bg-card)',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 24 }}>{prayerIcons[prayer]}</span>
                    <span className="badge badge-violet" style={{ fontSize: 10 }}>+5 XP</span>
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{prayer}</h4>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                    {prayerDescriptions[prayer]}
                  </p>
                </div>

                <button
                  onClick={() => togglePrayer(prayer, todayStr)}
                  className="btn"
                  style={{
                    width: '100%',
                    background: completed ? 'var(--color-bg-tertiary)' : 'var(--color-violet)',
                    color: completed ? 'var(--color-text-secondary)' : 'white',
                    border: completed ? '1px solid var(--color-border)' : 'none',
                    fontWeight: 600,
                    gap: 6,
                    padding: '8px 14px',
                    marginTop: 14,
                  }}
                >
                  {completed ? (
                    <>
                      <Check size={14} strokeWidth={3} /> Completed
                    </>
                  ) : (
                    'Mark Completed'
                  )}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Weekly Tracker Grid */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} style={{ color: 'var(--color-violet)' }} /> Weekly History Log
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 600 }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(7, 1fr)', borderBottom: '1px solid var(--color-border)', paddingBottom: 10, fontWeight: 600, fontSize: 12, color: 'var(--color-text-muted)' }}>
              <div>Prayer</div>
              {last7Days.map((d) => (
                <div key={d.toISOString()} style={{ textAlign: 'center' }}>
                  {format(d, 'EEE')} ({format(d, 'd')})
                </div>
              ))}
            </div>

            {/* Prayer rows */}
            {Object.values(PrayerName).map((prayer) => (
              <div
                key={prayer}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px repeat(7, 1fr)',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{prayerIcons[prayer]}</span>
                  <span>{prayer}</span>
                </div>
                {last7Days.map((d) => {
                  const dateStr = format(d, 'yyyy-MM-dd');
                  const completed = isPrayerCompleted(prayer, dateStr);
                  const isToday = dateStr === todayStr;

                  return (
                    <div key={dateStr} style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => togglePrayer(prayer, dateStr)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '4px',
                          border: isToday ? '1.5px solid var(--color-violet)' : '1px solid transparent',
                          background: completed ? 'var(--color-violet)' : 'var(--color-heat-0)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        title={`${prayer} — ${format(d, 'EEEE, MMM d')}: ${completed ? 'Completed' : 'Not completed'}`}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
