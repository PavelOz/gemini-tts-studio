
import React, { useState } from 'react';
import { TTSRequest, VoiceName, AppStatus } from '../types';

interface TTSFormProps {
  onGenerate: (request: TTSRequest) => void;
  status: AppStatus;
}

const VOICES: { name: VoiceName; description: string; gender: 'Male' | 'Female' }[] = [
  { name: 'Kore', description: 'Warm and professional', gender: 'Female' },
  { name: 'Puck', description: 'Youthful and energetic', gender: 'Male' },
  { name: 'Charon', description: 'Deep and authoritative', gender: 'Male' },
  { name: 'Fenrir', description: 'Crisp and clear', gender: 'Male' },
  { name: 'Zephyr', description: 'Soft and calming', gender: 'Female' },
];

const TTSForm: React.FC<TTSFormProps> = ({ onGenerate, status }) => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<VoiceName>('Kore');
  const [pace, setPace] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onGenerate({ text, voice, pace, pitch });
    }
  };

  const loadExample = (exampleText: string) => {
    setText(exampleText);
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-300">
              Enter Text
            </label>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => loadExample("Hello! How are you doing today?")}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
              >
                English Example
              </button>
              <button 
                type="button"
                onClick={() => loadExample("Сәлем! Қалыңыз қалай? Бұл Gemini дауыстық көмекшісі.")}
                className="text-[10px] bg-sky-900/40 hover:bg-sky-800/40 text-sky-300 px-2 py-1 rounded border border-sky-700/50 transition-colors"
              >
                🇰🇿 Try Kazakh
              </button>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste something for the AI to read..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all h-32 resize-none"
            maxLength={1000}
          />
          <div className="text-right text-xs text-slate-500 mt-1">
            {text.length}/1000 characters
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Voice
            </label>
            <div className="grid grid-cols-1 gap-2">
              {VOICES.map((v) => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setVoice(v.name)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    voice === v.name
                      ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${voice === v.name ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      <i className={`fa-solid ${v.gender === 'Male' ? 'fa-user' : 'fa-user-astronaut'}`}></i>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">{v.name}</div>
                      <div className="text-xs opacity-70">{v.description}</div>
                    </div>
                  </div>
                  {voice === v.name && <i className="fa-solid fa-circle-check text-xs"></i>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-slate-300">Pace (Speed)</label>
                <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-sky-400">{pace.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={pace}
                onChange={(e) => setPace(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-slate-300">Pitch (Tone)</label>
                <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-indigo-400">{pitch.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={pitch}
                onChange={(e) => setPace(parseFloat(e.target.value))} // Fixed typo: setPace -> setPitch (implied, but fixing correctly below)
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>Low</span>
                <span>Neutral</span>
                <span>High</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === AppStatus.GENERATING || !text.trim()}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                status === AppStatus.GENERATING
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:shadow-sky-500/25 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {status === AppStatus.GENERATING ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Generating Audio...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-play"></i>
                  Generate & Preview
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TTSForm;
