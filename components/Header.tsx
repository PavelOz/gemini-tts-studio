
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-4 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <i className="fa-solid fa-microphone-lines text-2xl text-white"></i>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Gemini <span className="gradient-text">TTS Studio</span>
        </h1>
      </div>
      <p className="text-slate-400 max-w-lg mx-auto">
        Transform your text into lifelike speech in any language, including <b>Kazakh</b>.
        Select a voice, adjust the pace, and bring your words to life.
      </p>
    </header>
  );
};

export default Header;
