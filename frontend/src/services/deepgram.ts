import * as FileSystem from 'expo-file-system';
import { DeepgramResponse, Note, NoteTopic, NoteSegment, NoteSentiment, NoteIntent } from '../types/note';
import { v4 as uuidv4 } from 'uuid';

const DEEPGRAM_API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY;
const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen';

interface ProcessingResult {
  success: boolean;
  note?: Note;
  error?: string;
}

function generateTitle(transcript: string, topics: NoteTopic[]): string {
  // Use first topic if available
  if (topics.length > 0) {
    return topics[0].topic.charAt(0).toUpperCase() + topics[0].topic.slice(1);
  }
  
  // Otherwise use first few words of transcript
  const words = transcript.split(' ').slice(0, 5);
  if (words.length > 0) {
    let title = words.join(' ');
    if (transcript.split(' ').length > 5) {
      title += '...';
    }
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  return 'Voice Note';
}

export async function processAudioWithDeepgram(audioUri: string): Promise<ProcessingResult> {
  try {
    if (!DEEPGRAM_API_KEY) {
      return { success: false, error: 'Deepgram API key not configured' };
    }

    // Read the audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to binary
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Build URL with query parameters for Audio Intelligence features
    const params = new URLSearchParams({
      model: 'nova-2',
      smart_format: 'true',
      punctuate: 'true',
      paragraphs: 'true',
      summarize: 'v2',
      topics: 'true',
      detect_topics: 'true',
      sentiment: 'true',
      intents: 'true',
      language: 'en',
    });

    const response = await fetch(`${DEEPGRAM_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      body: bytes,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram error:', errorText);
      return { success: false, error: `Deepgram API error: ${response.status}` };
    }

    const data: DeepgramResponse = await response.json();
    
    // Extract transcript
    const channel = data.results?.channels?.[0];
    const alternative = channel?.alternatives?.[0];
    const transcript = alternative?.transcript || '';
    const confidence = alternative?.confidence || 0;

    if (!transcript) {
      return { success: false, error: 'No speech detected in audio' };
    }

    // Extract segments from words
    const segments: NoteSegment[] = [];
    const words = alternative?.words || [];
    if (words.length > 0) {
      // Group words into segments (roughly sentence-length)
      let currentSegment: NoteSegment = {
        text: '',
        start: words[0].start,
        end: words[0].end,
        confidence: 0,
      };
      let confidenceSum = 0;
      let wordCount = 0;

      for (const word of words) {
        currentSegment.text += (currentSegment.text ? ' ' : '') + word.word;
        currentSegment.end = word.end;
        confidenceSum += word.confidence;
        wordCount++;

        // End segment at punctuation or after 15 words
        if (word.word.match(/[.!?]$/) || wordCount >= 15) {
          currentSegment.confidence = confidenceSum / wordCount;
          segments.push({ ...currentSegment });
          currentSegment = {
            text: '',
            start: word.end,
            end: word.end,
            confidence: 0,
          };
          confidenceSum = 0;
          wordCount = 0;
        }
      }

      // Add remaining segment
      if (currentSegment.text) {
        currentSegment.confidence = wordCount > 0 ? confidenceSum / wordCount : 0;
        segments.push(currentSegment);
      }
    }

    // Extract topics
    const topics: NoteTopic[] = [];
    const topicsData = data.results?.topics?.segments || [];
    for (const segment of topicsData) {
      for (const topic of segment.topics || []) {
        // Avoid duplicates
        if (!topics.find(t => t.topic === topic.topic)) {
          topics.push({
            topic: topic.topic,
            confidence: topic.confidence,
          });
        }
      }
    }

    // Extract summary
    const summary = data.results?.summary?.short || '';

    // Extract sentiment
    let sentiment: NoteSentiment | null = null;
    const sentimentData = data.results?.sentiments;
    if (sentimentData?.average) {
      sentiment = {
        sentiment: sentimentData.average.sentiment as 'positive' | 'negative' | 'neutral',
        confidence: sentimentData.average.sentiment_score,
        segments: sentimentData.segments?.map(s => ({
          text: s.text,
          sentiment: s.sentiment,
          confidence: s.sentiment_score,
        })),
      };
    }

    // Extract intent
    let intent: NoteIntent | null = null;
    const intentData = data.results?.intents?.segments?.[0];
    if (intentData) {
      intent = {
        intent: intentData.intent,
        confidence: intentData.confidence,
      };
    }

    // Get duration
    const duration = data.metadata?.duration || 0;

    // Create note
    const now = new Date().toISOString();
    const note: Note = {
      id: uuidv4(),
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
  } catch (error) {
    console.error('Error processing audio:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}
