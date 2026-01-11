import { useState, useRef, useEffect } from 'react';
import { GeminiContent } from '../services/GeminiContent';
import { Scenario } from '../interfaces/Scenario';

export function useLesson() {
    const [lesson, setLesson] = useState<Scenario | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const generatorRef = useRef<GeminiContent | null>(null);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
            generatorRef.current = new GeminiContent(apiKey);
        }
    }, []);

    const generateLesson = async (
        topic: string,
        sourceLang: string = 'English',
        targetLang: string = 'English',
        difficulty: string = 'medium'
    ) => {
        if (!generatorRef.current) {
            setError("Service not initialized (Missing API Key)");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await generatorRef.current.generate(topic, sourceLang, targetLang, difficulty);
            setLesson(data);
        } catch (err: any) {
            console.error(err);
            setError("Failed to generate lesson. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        lesson,
        isLoading,
        error,
        generateLesson
    };
}
