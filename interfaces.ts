export interface VoiceProvider {
  /**
   * Generates audio from text.
   * @param text The sentence to speak
   * @param speed 0.5 (slow) to 1.5 (fast). 1.0 is natural.
   * @param voiceId The specific character (e.g., "en-US-Andrew" or "Gemini-Voice-A")
   */
  speak(text: string, speed: number, voiceId: string): Promise<ArrayBuffer>;
}
