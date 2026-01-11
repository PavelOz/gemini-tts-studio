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
      </header>

      {/* --- Topic Generator --- */}
      <section className="card">
        <h2 className="section-title">Dialog Generator</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            className="text-input"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Topic (e.g., Ordering Coffee)"
            disabled={isLessonLoading}
          />
          <button
            className="btn-primary"
            style={{ width: 'auto' }}
            onClick={() => {
              generateLesson(topic, 'medium');
              setActiveBubbleIndex(null);
            }}
            disabled={isLessonLoading || !topic}
          >
            {isLessonLoading ? 'Writing Script...' : 'Generate Dialog'}
          </button>
        </div>
      </section>

      {/* Global Settings (Optional but helpful context) */}
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
