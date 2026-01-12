import React, { useState, useEffect, useRef } from 'react';
import { GeminiVoice } from './services/GeminiVoice';
import { useLesson } from './hooks/useLesson';
import { DialogBubble } from './components/DialogBubble';
import './index.css';

const VOICES = [
  { id: 'Aoede', name: 'Aoede (Female)' },
  { id: 'Charon', name: 'Charon (Male)' },
  { id: 'Fenrir', name: 'Fenrir (Male)' },
  { id: 'Kore', name: 'Kore (Female)' },
  { id: 'Puck', name: 'Puck (Male)' },
];

function App() {
  // --- Module 3: The Brain (Scenario & State) ---
  const { lesson, isLoading: isLessonLoading, generateLesson } = useLesson();
  const [topic, setTopic] = useState("");
  const [activeBubbleIndex, setActiveBubbleIndex] = useState<number | null>(null);

  // --- Module 4: Settings & Logic ---
  const [sourceLang, setSourceLang] = useState("English");
  const [targetLang, setTargetLang] = useState("English");
  const [difficulty, setDifficulty] = useState("medium");
  const [showPinyin, setShowPinyin] = useState(true);
  const [sessionScores, setSessionScores] = useState<number[]>([]);

  // Calculate Average Session Score
  const averageScore = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : null;

  // --- Module 1: TTS State ---
  const [speed, setSpeed] = useState(1.0);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [voiceProvider, setVoiceProvider] = useState<GeminiVoice | null>(null);

  // Refs
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      setVoiceProvider(new GeminiVoice(apiKey));
    }
  }, []);

  // Scroll to bottom when lesson loads
  useEffect(() => {
    if (lesson && scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lesson]);

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      <header>
        <h1>Shadowing Studio</h1>
        {averageScore !== null && (
          <div className="session-score" style={{
            background: 'var(--surface)',
            padding: '4px 12px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            fontWeight: 600,
            color: averageScore > 80 ? '#4ade80' : '#fbbf24'
          }}>
            Avg. Score: {averageScore}
          </div>
        )}
      </header>

      {/* --- Settings Bar (Sticky) --- */}
      <section className="card" style={{ position: 'sticky', top: 10, zIndex: 50, border: '1px solid var(--primary)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Translate To</label>
            <select className="text-input" value={sourceLang} onChange={e => setSourceLang(e.target.value)} style={{ padding: '6px' }}>
              <option value="English">English</option>
              <option value="Russian">Russian</option>
            </select>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target Language</label>
              {targetLang.includes('Chinese') && (
                <label style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showPinyin} onChange={e => setShowPinyin(e.target.checked)} />
                  Pinyin
                </label>
              )}
            </div>
            <select className="text-input" value={targetLang} onChange={e => setTargetLang(e.target.value)} style={{ padding: '6px' }}>
              <option value="English">English</option>
              <option value="Chinese (Mandarin)">Chinese</option>
              <option value="Kazakh">Kazakh</option>
              <option value="French">French</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="text-input"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            style={{ width: '80px', padding: '8px' }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Med</option>
            <option value="hard">Hard</option>
          </select>
          <input
            className="text-input"
            style={{ flex: 1 }}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Topic..."
            disabled={isLessonLoading}
          />
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '0 16px' }}
            onClick={() => {
              generateLesson(topic, sourceLang, targetLang, difficulty);
              setActiveBubbleIndex(null);
              setSessionScores([]); // Reset score on new lesson
            }}
            disabled={isLessonLoading || !topic}
          >
            {isLessonLoading ? '...' : 'Go'}
          </button>
        </div>
      </section>

      {/* Global Settings (Voices) */}
      <section style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
        <select
          className="text-input"
          style={{ width: 'auto', padding: '6px', fontSize: '0.8rem' }}
          value={voiceId} onChange={e => setVoiceId(e.target.value)}
        >
          {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem' }}>{speed}x</span>
          <input
            type="range" min="0.5" max="1.5" step="0.1"
            value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
            style={{ width: '60px' }}
          />
        </div>
      </section>

      {/* --- Dialog View --- */}
      {lesson && (
        <section style={{ marginTop: '24px' }}>
          <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '16px' }}>
            {lesson.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {lesson.items.map((item, idx) => (
              <DialogBubble
                key={idx}
                item={item}
                isActive={activeBubbleIndex === idx}
                onClick={() => setActiveBubbleIndex(activeBubbleIndex === idx ? null : idx)}
                voiceProvider={voiceProvider}
                voiceId={voiceId}
                speed={speed}
                onScore={(score) => setSessionScores(prev => [...prev, score])}
                showTransliteration={showPinyin}
              />
            ))}
            <div ref={scrollEndRef} />
          </div>
        </section>
      )}

    </div>
  );
}

export default App;
