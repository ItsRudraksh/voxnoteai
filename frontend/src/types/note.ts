export interface NoteSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface NoteTopic {
  topic: string;
  confidence: number;
}

export interface NoteSentiment {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  segments?: {
    text: string;
    sentiment: string;
    confidence: number;
  }[];
}

export interface NoteIntent {
  intent: string;
  confidence: number;
}

export interface Note {
  id: string;
  title: string;
  transcript: string;
  summary: string;
  topics: NoteTopic[];
  segments: NoteSegment[];
  sentiment: NoteSentiment | null;
  intent: NoteIntent | null;
  duration: number;
  audioPath: string;
  createdAt: string;
  updatedAt: string;
  confidence: number;
}

export interface DeepgramResponse {
  results: {
    channels: {
      alternatives: {
        transcript: string;
        confidence: number;
        words: {
          word: string;
          start: number;
          end: number;
          confidence: number;
        }[];
      }[];
    }[];
    summary?: {
      short: string;
    };
    topics?: {
      segments: {
        text: string;
        start_word: number;
        end_word: number;
        topics: {
          topic: string;
          confidence: number;
        }[];
      }[];
    };
    sentiments?: {
      segments: {
        text: string;
        start_word: number;
        end_word: number;
        sentiment: string;
        sentiment_score: number;
      }[];
      average: {
        sentiment: string;
        sentiment_score: number;
      };
    };
    intents?: {
      segments: {
        text: string;
        start_word: number;
        end_word: number;
        intent: string;
        confidence: number;
      }[];
    };
  };
  metadata: {
    duration: number;
  };
}
