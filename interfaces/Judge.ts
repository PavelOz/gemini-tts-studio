export interface FeedbackResult {
    score: number;
    transcription: string;
    errors: Array<{
        word: string;
        errorType: 'mispronounced' | 'missed' | 'extra';
    }>;
    tips: string;
}

export interface PronunciationJudge {
    /**
     * Evaluates the user's audio against the target text.
     * @param userAudio The user's recorded audio as a Blob (e.g. from MediaRecorder).
     * @param targetText The text the user was trying to say.
     * @param referenceAudio Optional reference audio buffer from TTS.
     */
    evaluate(
        userAudio: Blob,
        targetText: string,
        referenceAudio?: ArrayBuffer
    ): Promise<FeedbackResult>;
}
