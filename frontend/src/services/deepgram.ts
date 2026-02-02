// import { createClient } from '@deepgram/sdk';
// import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system/legacy';
import type { Note, NoteTopic, NoteSegment, NoteSentiment, NoteIntent } from '../types/note';

/** Unique ID for notes (RN doesn't have crypto.getRandomValues). */
function uniqueId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

const DEEPGRAM_API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY;

interface ProcessingResult {
  success: boolean;
  note?: Note;
  error?: string;
}

function generateTitle(transcript: string, topics: NoteTopic[]): string {
  if (topics.length > 0) {
    return topics[0].topic.charAt(0).toUpperCase() + topics[0].topic.slice(1);
  }
  const words = transcript.split(' ').slice(0, 5);
  if (words.length > 0) {
    let title = words.join(' ');
    if (transcript.split(' ').length > 5) title += '...';
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
  return 'Voice Note';
}

/** API can return confidence or confidence_score, sentiment_score, etc. */
function topicConfidence(t: { confidence?: number; confidence_score?: number }): number {
  return t.confidence ?? (t as { confidence_score?: number }).confidence_score ?? 0;
}

export async function processAudioWithDeepgram(audioUri: string): Promise<ProcessingResult> {
  try {
    if (!DEEPGRAM_API_KEY) {
      return { success: false, error: 'Deepgram API key not configured' };
    }

    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // const audioBuffer = Buffer.from(bytes);

    const response = await fetch(
      'https://api.deepgram.com/v1/listen?' +
      new URLSearchParams({
        model: 'nova-2',
        smart_format: 'true',
        punctuate: 'true',
        paragraphs: 'true',
        language: 'en',
        topics: 'true',
        summarize: 'v2',
        sentiment: 'true',
        intents: 'true',
      }),
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/wav',
        },
        body: Uint8Array.from(bytes), // same audio data you already build
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Deepgram HTTP error:', text);
      return { success: false, error: 'Deepgram API error' };
    }

    const result = await response.json();

    if (!result) {
      return { success: false, error: 'No result from Deepgram' };
    }

    const data = result as {
      results?: {
        channels?: { alternatives?: { transcript?: string; confidence?: number; words?: { word: string; start: number; end: number; confidence: number }[] }[] }[];
        summary?: { short?: string };
        topics?: { segments?: { topics?: { topic: string; confidence?: number; confidence_score?: number }[] }[] };
        sentiments?: {
          segments?: { text: string; sentiment: string; sentiment_score?: number }[];
          average?: { sentiment: string; sentiment_score?: number };
        };
        intents?: { segments?: { intent: string; confidence?: number; confidence_score?: number }[] };
      };
      metadata?: { duration?: number };
    };

    const channel = data.results?.channels?.[0];
    const alternative = channel?.alternatives?.[0];
    const transcript = alternative?.transcript ?? '';
    const confidence = alternative?.confidence ?? 0;

    if (!transcript) {
      return { success: false, error: 'No speech detected in audio' };
    }

    const words = alternative?.words ?? [];
    const segments: NoteSegment[] = [];
    if (words.length > 0) {
      let currentSegment: NoteSegment = { text: '', start: words[0].start, end: words[0].end, confidence: 0 };
      let confidenceSum = 0;
      let wordCount = 0;

      for (const word of words) {
        currentSegment.text += (currentSegment.text ? ' ' : '') + word.word;
        currentSegment.end = word.end;
        confidenceSum += word.confidence;
        wordCount++;
        if (word.word.match(/[.!?]$/) || wordCount >= 15) {
          currentSegment.confidence = confidenceSum / wordCount;
          segments.push({ ...currentSegment });
          currentSegment = { text: '', start: word.end, end: word.end, confidence: 0 };
          confidenceSum = 0;
          wordCount = 0;
        }
      }
      if (currentSegment.text) {
        currentSegment.confidence = wordCount > 0 ? confidenceSum / wordCount : 0;
        segments.push(currentSegment);
      }
    }

    const topics: NoteTopic[] = [];
    const topicsData = data.results?.topics?.segments ?? [];
    for (const segment of topicsData) {
      for (const topic of segment.topics ?? []) {
        if (!topics.some((t) => t.topic === topic.topic)) {
          topics.push({ topic: topic.topic, confidence: topicConfidence(topic) });
        }
      }
    }

    const summary = data.results?.summary?.short ?? '';

    let sentiment: NoteSentiment | null = null;
    const sentimentData = data.results?.sentiments;
    if (sentimentData?.average) {
      const avg = sentimentData.average;
      const score = avg.sentiment_score ?? 0;
      sentiment = {
        sentiment: avg.sentiment as 'positive' | 'negative' | 'neutral',
        confidence: Math.abs(score),
        segments: sentimentData.segments?.map((s) => ({
          text: s.text,
          sentiment: s.sentiment,
          confidence: Math.abs(s.sentiment_score ?? 0),
        })),
      };
    }

    let intent: NoteIntent | null = null;
    const firstIntent = data.results?.intents?.segments?.[0];
    if (firstIntent) {
      const conf = firstIntent.confidence ?? (firstIntent as { confidence_score?: number }).confidence_score ?? 0;
      intent = { intent: firstIntent.intent, confidence: conf };
    }

    const duration = data.metadata?.duration ?? 0;
    const now = new Date().toISOString();
    const note: Note = {
      id: uniqueId(),
      title: generateTitle(transcript, topics),
      transcript,
      summary,
      topics,
      segments,
      sentiment,
      intent,
      duration,
      audioPath: audioUri,
      confidence,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, note };
  } catch (err) {
    console.error('Error processing audio:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}
