
import React from 'react';
import { AudioHistoryItem } from '../types';

interface AudioHistoryProps {
  items: AudioHistoryItem[];
  onPlay: (item: AudioHistoryItem) => void;
  onDownload: (item: AudioHistoryItem) => void;
  onDelete: (id: string) => void;
}

const AudioHistory: React.FC<AudioHistoryProps> = ({ items, onPlay, onDownload, onDelete }) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <i className="fa-solid fa-clock-rotate-left text-sky-400"></i>
        Recent Generations
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4 overflow-hidden">
              <button
                onClick={() => onPlay(item)}
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 hover:bg-sky-500 hover:text-white transition-all"
              >
                <i className="fa-solid fa-play"></i>
              </button>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate pr-4">
                  {item.text}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                    {item.voice}
                  </span>
                  <span className="text-[10px] text-slate-500 italic">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDownload(item)}
                title="Download WAV"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                <i className="fa-solid fa-download text-sm"></i>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                title="Remove"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <i className="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioHistory;
