import { ContentGenerator, Scenario } from "../interfaces/Scenario";
import { GoogleGenAI } from "@google/genai";

export class GeminiContent implements ContentGenerator {
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    async generate(topic: string, level: string): Promise<Scenario> {
        const systemInstruction = `You are a scriptwriter for language learners. 
Create a realistic dialogue between two people about the topic: '${topic}'. 
Level: '${level}'. 
Alternating speakers (A/B). 
Return a JSON object matching the Scenario schema. 
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
                            original: { type: "STRING", description: "The sentence in the target language (English)." },
                            translation: { type: "STRING", description: "Translation or meaning hint." },
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
