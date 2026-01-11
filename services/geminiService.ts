
import { GoogleGenAI, Modality } from "@google/genai";
import { TTSRequest, VoiceName } from "../types";
import { decode, decodeAudioData } from "../utils/audio";

export class GeminiTTSService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateSpeech(request: TTSRequest): Promise<{ buffer: AudioBuffer; audioContext: AudioContext }> {
    const { text, voice, pace, pitch } = request;

    const paceInstruction = pace < 0.8 ? "slowly" : pace > 1.2 ? "quickly" : "at a natural pace";
    const pitchInstruction = pitch < 0.8 ? "with a low pitch" : pitch > 1.2 ? "with a high pitch" : "with natural intonation";
    
    // Improved prompt for multilingual accuracy
    const prompt = `Narrate the following text exactly as written, speaking ${paceInstruction} and ${pitchInstruction}. Use the correct pronunciation for the language the text is written in: "${text}"`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini API");
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );

    return { buffer: audioBuffer, audioContext };
  }
}

export const ttsService = new GeminiTTSService();
