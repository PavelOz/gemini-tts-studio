import React, { useState, useRef, useEffect } from 'react';
import { LessonItem } from '../interfaces/Scenario';
import { GeminiVoice } from '../services/GeminiVoice';
import { JudgeTestBench } from './JudgeTestBench';

interface DialogBubbleProps {
    item: LessonItem;
    isActive: boolean;
    onClick: () => void;
    voiceProvider: GeminiVoice | null;
    voiceId: string;
    speed: number;
    onScore: (score: number) => void;
}

export const DialogBubble: React.FC<DialogBubbleProps> = ({
    item,
    isActive,
    onClick,
    voiceProvider,
    voiceId,
    speed,
    onScore
}) => {
    const isMe = item.speaker === 'B';
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Reset audio when item changes (unlikely if keyed by idx) or collapse?
    // We can keep the audio url cached if we want.

    const handlePlay = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!voiceProvider) return;

        setIsLoading(true);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);

        try {
            const buffer = await voiceProvider.speak(item.original, playbackSpeed, voiceId);
            const blob = new Blob([buffer], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            // Wait for state update then play
            setTimeout(() => {
                audioRef.current?.play().catch(console.warn);
            }, 50);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const bubbleStyle: React.CSSProperties = {
        maxWidth: '90%',
        padding: '16px',
        borderRadius: '16px',
        borderBottomLeftRadius: item.speaker === 'A' ? '4px' : '16px',
        borderBottomRightRadius: item.speaker === 'B' ? '4px' : '16px',
        backgroundColor: isActive
            ? 'var(--surface)' // Expanded state might need distinct background to hold tools
            : (item.speaker === 'A' ? '#334155' : '#475569'),
        color: '#f8fafc',
        cursor: 'pointer',
        boxShadow: isActive ? '0 0 0 2px var(--primary)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    };

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: item.speaker === 'A' ? 'flex-start' : 'flex-end',
        marginBottom: '16px',
        width: '100%'
    };

    return (
        <div style={containerStyle} onClick={onClick}>
            <div style={bubbleStyle}>
                {/* Header (Text) */}
                <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>
                        {item.original}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, color: '#cbd5e1' }}>
                        {item.translation}
                    </div>
                    {item.context_notes && (
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', fontStyle: 'italic', opacity: 0.6 }}>
                            ({item.context_notes})
                        </div>
                    )}
                </div>

                {/* Body (Studio Buttons) - Inline Accordion */}
                <div style={{
                    maxHeight: isActive ? '500px' : '0',
                    opacity: isActive ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderTop: isActive ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    paddingTop: isActive ? '12px' : '0'
                }}>
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        {/* TTS Controls */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Speed: {playbackSpeed}x</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="1.5"
                                    step="0.1"
                                    value={playbackSpeed}
                                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                                    style={{ width: '60%' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button
                                    className="btn-primary"
                                    onClick={handlePlay}
                                    disabled={isLoading}
                                    style={{ padding: '8px 16px', fontSize: '0.9rem', flex: 1 }}
                                >
                                    {isLoading ? 'Loading...' : '▶ Listen'}
                                </button>
                                {audioUrl && <audio ref={audioRef} src={audioUrl} />}
                            </div>
                        </div>

                        {/* Judge Recorder */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px' }}>
                            <JudgeTestBench activeSentence={item.original} onScore={onScore} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
