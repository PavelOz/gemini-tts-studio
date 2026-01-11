export interface LessonItem {
    original: string;
    translation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    context_notes?: string;
    speaker: 'A' | 'B';
}

export interface Scenario {
    title: string;
    items: LessonItem[];
    vocabulary: string[];
}

export interface ContentGenerator {
    generate(topic: string, level: string): Promise<Scenario>;
}
