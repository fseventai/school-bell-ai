import type { BellSettings } from '$lib/types';

export interface AudioResponse {
  data: string;
  mimeType: string;
}

export async function generateAudio(text: string, voiceName: string = 'Kore'): Promise<AudioResponse> {
  const response = await fetch('/api/generate-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceName })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate audio');
  }

  return response.json();
}

function createWavHeader(dataLength: number, sampleRate: number = 24000): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // file length
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true); // PCM
  // channel count
  view.setUint16(22, 1, true); // Mono
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // data chunk length
  view.setUint32(40, dataLength, true);

  return header;
}

export function playAudioFromBase64(base64Data: string, volume: number = 1.0, mimeType: string = 'audio/mp3') {
  if (typeof window === 'undefined') return;

  let audioSrc: string;

  if (mimeType.includes('pcm')) {
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = createWavHeader(len, 24000);
    const wavFile = new Uint8Array(wavHeader.byteLength + len);
    wavFile.set(new Uint8Array(wavHeader), 0);
    wavFile.set(bytes, wavHeader.byteLength);

    const blob = new Blob([wavFile], { type: 'audio/wav' });
    audioSrc = URL.createObjectURL(blob);
  } else {
    audioSrc = `data:${mimeType};base64,${base64Data}`;
  }

  const audio = new Audio(audioSrc);
  audio.volume = volume;
  return audio.play();
}

export const geminiService = {
  generateAudio,
  playAudioFromBase64,
  async generateAndPlay(text: string, settings: BellSettings) {
    const audioData = await generateAudio(text, settings.voiceName);
    return playAudioFromBase64(audioData.data, settings.volume / 100, audioData.mimeType);
  }
};
