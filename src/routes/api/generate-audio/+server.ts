import { json } from '@sveltejs/kit';
import { GoogleGenAI, Modality } from '@google/genai';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

interface GenerateAudioRequest {
  text: string;
  voiceName?: string;
}

export const POST: RequestHandler = async ({ request }) => {
  const { text, voiceName = 'Kore' } = (await request.json()) as GenerateAudioRequest;

  if (!env.GEMINI_API_KEY) {
    return json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const candidate = result.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (part?.inlineData) {
      return json({
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'audio/pcm'
      });
    }

    return json({ error: 'Model did not return audio data.' }, { status: 500 });
  } catch (error: unknown) {
    console.error('Error generating audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio';
    return json({ error: errorMessage }, { status: 500 });
  }
};
