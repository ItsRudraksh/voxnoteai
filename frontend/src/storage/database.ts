import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types/note';

// Storage keys for AsyncStorage
const NOTES_KEY = '@voxnote_notes';
const SETTINGS_PREFIX = '@voxnote_setting_';

// For native platforms, we'll use SQLite, but for now use AsyncStorage everywhere
// This ensures web compatibility

let initialized = false;

export async function initDatabase(): Promise<void> {
  if (initialized) return;
  initialized = true;
  
  // Initialize storage - AsyncStorage doesn't need explicit initialization
  // Just ensure the keys exist
  const notes = await AsyncStorage.getItem(NOTES_KEY);
  if (notes === null) {
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify([]));
  }
}

export async function saveNote(note: Note): Promise<void> {
  if (!db) await initDatabase();
  
  const statement = await db!.prepareAsync(`
    INSERT OR REPLACE INTO notes (id, title, transcript, summary, topics, segments, sentiment, intent, duration, audioPath, confidence, createdAt, updatedAt)
    VALUES ($id, $title, $transcript, $summary, $topics, $segments, $sentiment, $intent, $duration, $audioPath, $confidence, $createdAt, $updatedAt)
  `);
  
  try {
    await statement.executeAsync({
      $id: note.id,
      $title: note.title,
      $transcript: note.transcript,
      $summary: note.summary || '',
      $topics: JSON.stringify(note.topics || []),
      $segments: JSON.stringify(note.segments || []),
      $sentiment: JSON.stringify(note.sentiment),
      $intent: JSON.stringify(note.intent),
      $duration: note.duration,
      $audioPath: note.audioPath || '',
      $confidence: note.confidence,
      $createdAt: note.createdAt,
      $updatedAt: note.updatedAt,
    });
  } finally {
    await statement.finalizeAsync();
  }
}

export async function getAllNotes(): Promise<Note[]> {
  if (!db) await initDatabase();
  
  const rows = await db!.getAllAsync<{
    id: string;
    title: string;
    transcript: string;
    summary: string;
    topics: string;
    segments: string;
    sentiment: string;
    intent: string;
    duration: number;
    audioPath: string;
    confidence: number;
    createdAt: string;
    updatedAt: string;
  }>('SELECT * FROM notes ORDER BY createdAt DESC');
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    transcript: row.transcript,
    summary: row.summary,
    topics: JSON.parse(row.topics || '[]'),
    segments: JSON.parse(row.segments || '[]'),
    sentiment: row.sentiment ? JSON.parse(row.sentiment) : null,
    intent: row.intent ? JSON.parse(row.intent) : null,
    duration: row.duration,
    audioPath: row.audioPath,
    confidence: row.confidence,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function getNoteById(id: string): Promise<Note | null> {
  if (!db) await initDatabase();
  
  const row = await db!.getFirstAsync<{
    id: string;
    title: string;
    transcript: string;
    summary: string;
    topics: string;
    segments: string;
    sentiment: string;
    intent: string;
    duration: number;
    audioPath: string;
    confidence: number;
    createdAt: string;
    updatedAt: string;
  }>('SELECT * FROM notes WHERE id = ?', [id]);
  
  if (!row) return null;
  
  return {
    id: row.id,
    title: row.title,
    transcript: row.transcript,
    summary: row.summary,
    topics: JSON.parse(row.topics || '[]'),
    segments: JSON.parse(row.segments || '[]'),
    sentiment: row.sentiment ? JSON.parse(row.sentiment) : null,
    intent: row.intent ? JSON.parse(row.intent) : null,
    duration: row.duration,
    audioPath: row.audioPath,
    confidence: row.confidence,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function updateNoteTitle(id: string, title: string): Promise<void> {
  if (!db) await initDatabase();
  
  await db!.runAsync(
    'UPDATE notes SET title = ?, updatedAt = ? WHERE id = ?',
    [title, new Date().toISOString(), id]
  );
}

export async function deleteNote(id: string): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync('DELETE FROM notes WHERE id = ?', [id]);
}

export async function getSetting(key: string): Promise<string | null> {
  if (!db) await initDatabase();
  const row = await db!.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key]
  );
  return row?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}
