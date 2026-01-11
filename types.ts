
export type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface TTSRequest {
  text: string;
  voice: VoiceName;
  pace: number;
  pitch: number;
}

export interface AudioHistoryItem {
  id: string;
  text: string;
  timestamp: number;
  voice: VoiceName;
  audioBlob: Blob;
  audioUrl: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}
