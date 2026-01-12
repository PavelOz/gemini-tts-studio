import { ContentGenerator, Scenario } from "../interfaces/Scenario";
import { GoogleGenAI } from "@google/genai";

export class GeminiContent implements ContentGenerator {
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    async generate(topic: string, sourceLang: string = 'English', targetLang: string = 'English', difficulty: string = 'medium'): Promise<Scenario> {
        const systemInstruction = `You are a scriptwriter for language learners. 
Create a realistic dialogue between two people about the topic: '${topic}'. 
Target Language: '${targetLang}'.
Source Language (for translations): '${sourceLang}'.
Difficulty Level: '${difficulty}'.
Alternating speakers (A/B). 
Return a JSON object matching the Scenario schema.

STRICT FORMATTING RULES:
1. CLEAN TEXT ONLY: The 'original' field must contain ONLY the target language script (e.g., Chinese characters). Do NOT include Pinyin or parentheses or ANY romanization in this field.
2. MANDATORY SEPARATION: If the Target Language is 'Chinese (Mandarin)', you MUST put the Pinyin (with tone marks) in the 'transliteration' field. If the language is NOT Chinese, transliteration can be null.

The 'original' text must be in ${targetLang}.
The 'translation' text must be in ${sourceLang}.
Include 6-10 distinct turns.
Do not include chatty conversational filler unless natural for the lesson.`;

        const schema = {
            type: "OBJECT",
            properties: {
                title: { type: "STRING", description: "A creative title for this dialogue." },
                items: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            original: { type: "STRING", description: `The sentence in ${targetLang}.` },
                            translation: { type: "STRING", description: `Translation in ${sourceLang}.` },
                            transliteration: { type: "STRING", description: "Pinyin or Romanization (optional)." },
                            difficulty: { type: "STRING", enum: ["easy", "medium", "hard"] },
                            context_notes: { type: "STRING", description: "Context or emotion." },
                            speaker: { type: "STRING", enum: ["A", "B"] }
                        },
                        required: ["original", "difficulty", "speaker"]
                    }
                },
                vocabulary: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: "Key vocabulary words used in the dialogue."
                }
            },
            required: ["title", "items", "vocabulary"]
        };

        const response = await this.ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ parts: [{ text: systemInstruction }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const result = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!result) throw new Error("No response from Gemini Content Generator");

        return JSON.parse(result) as Scenario;
    }
}
