import { VoiceProvider } from "../interfaces";
import { GoogleGenAI } from "@google/genai";

export class GeminiVoice implements VoiceProvider {
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    async speak(text: string, speed: number, voiceId: string): Promise<ArrayBuffer> {
        // 1. Convert numeric speed to Natural Language Instruction
        // This is the "Magic" that fixes the robotic sound
        let instruction = "at a natural, conversational pace";
        if (speed <= 0.7) instruction = "very slowly, articulating every syllable clearly like a teacher";
        else if (speed >= 1.3) instruction = "quickly and excitedly";

        const prompt = `Narrate the following text exactly: "${text}". Speak ${instruction}.`;

        // 2. Call Gemini 2.5 Flash
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceId } } },
            },
        });

        // 3. Return raw audio buffer
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio from Gemini");

        // Browser-compatible Base64 decoding
        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Wrap raw PCM in WAV header (Assuming 24kHz, Mono, 16-bit)
        return addWavHeader(bytes, 24000, 1, 16);
    }
}

// Utility to add WAV header to raw PCM data
function addWavHeader(samples: Uint8Array, sampleRate: number, numChannels: number, bitDepth: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length, true);

    const pcm = new Uint8Array(buffer, 44);
    pcm.set(samples);

    return buffer;
}
