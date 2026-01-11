import React, { useState, useRef, useEffect } from 'react';
import { GeminiJudge } from '../services/GeminiJudge';
import { startAudioRecording } from '../utils/recorder';
import { FeedbackResult } from '../interfaces/Judge';

export function JudgeTestBench({ activeSentence, onScore }: { activeSentence?: string; onScore?: (score: number) => void }) {
    const [targetText, setTargetText] = useState(activeSentence || "Hello, I would like a coffee");

    // Update local state if prop changes
    useEffect(() => {
        if (activeSentence) setTargetText(activeSentence);
    }, [activeSentence]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopRecordingRef = useRef<(() => Promise<Blob>) | null>(null);
    const judgeRef = useRef<GeminiJudge | null>(null);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
            judgeRef.current = new GeminiJudge(apiKey);
        } else {
            setError("Missing API Key");
        }
    }, []);

    const handleStartRecording = async () => {
        try {
            setError(null);
            setFeedback(null);
            const { stop } = await startAudioRecording();
            stopRecordingRef.current = stop;
            setIsRecording(true);
        } catch (err: any) {
            console.error(err);
            setError("Could not access microphone.");
        }
    };

    const handleStopRecording = async () => {
        if (!stopRecordingRef.current) return;

        setIsRecording(false);
        setIsProcessing(true);

        try {
            const audioBlob = await stopRecordingRef.current();

            if (!judgeRef.current) throw new Error("Judge service not ready");

            const result = await judgeRef.current.evaluate(audioBlob, targetText);
            setFeedback(result);
            if (onScore) onScore(result.score);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Evaluation failed");
        } finally {
            setIsProcessing(false);
            stopRecordingRef.current = null;
        }
    };

    // Helper to render text with colored highlights
    const renderHighlightedText = () => {
        if (!feedback) return <p className="text-xl">{targetText}</p>;

        const words = targetText.split(/\s+/);
        // Naive mapping: This assumes the AI error list maps cleanly to these words.
        // In a production app, we need strictly aligned indices, but for a test bench, 
        // we'll try to find the word in the error list.

        return (
            <p className="text-xl leading-relaxed">
                {words.map((word, i) => {
                    const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
                    const err = feedback.errors.find(e => e.word.toLowerCase() === cleanWord);

                    let className = "text-green-400"; // Default perfect
                    if (err) {
                        if (err.errorType === 'mispronounced') className = "text-red-400 font-bold";
                        if (err.errorType === 'missed') className = "text-red-500 line-through decoration-2";
                        if (err.errorType === 'extra') className = "text-yellow-400"; // Usually extra words aren't in target text though
                    }

                    return (
                        <span key={i} className={`mr-1 ${className}`}>
                            {word}
                        </span>
                    );
                })}
            </p>
        );
    };

    return (
        <div className="card">
            <h2 className="section-title">Pronunciation Judge</h2>

            <div className="control-group">
                <label>Target Sentence</label>
                <input
                    type="text"
                    value={targetText}
                    onChange={e => setTargetText(e.target.value)}
                    className="text-input"
                    placeholder="Type what you want to say..."
                />
            </div>

            <div className="visualizer-area">
                <div className={`record-indicator ${isRecording ? 'active' : ''}`}>
                    {isRecording ? '🔴 Recording...' : 'Tap to Record'}
                </div>
            </div>

            <button
                className={`btn-record ${isRecording ? 'recording' : ''}`}
                onMouseDown={handleStartRecording}
                onMouseUp={handleStopRecording}
                onTouchStart={handleStartRecording}
                onTouchEnd={handleStopRecording}
                disabled={isProcessing}
            >
                {isProcessing ? 'Thinking...' : isRecording ? 'Release to Grade' : 'Hold to Record'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {feedback && (
                <div className="feedback-container">
                    <div className="score-badge">
                        <span className="score-val">{feedback.score}</span>
                        <span className="score-label" style={{ marginLeft: '4px' }}>Score</span>
                    </div>

                    <div className="transcription-box">
                        <label>Transcription:</label>
                        <p>"{feedback.transcription}"</p>
                    </div>

                    <div className="highlight-box">
                        {renderHighlightedText()}
                    </div>

                    {feedback.tips && (
                        <div className="tips-box">
                            <label>Coach Tips:</label>
                            <p>{feedback.tips}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
