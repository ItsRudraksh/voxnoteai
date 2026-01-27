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
  await initDatabase();
  
  const notes = await getAllNotes();
  const existingIndex = notes.findIndex(n => n.id === note.id);
  
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note); // Add to beginning
  }
  
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function getAllNotes(): Promise<Note[]> {
  await initDatabase();
  
  const notesJson = await AsyncStorage.getItem(NOTES_KEY);
  if (!notesJson) return [];
  
  try {
    const notes = JSON.parse(notesJson) as Note[];
    // Sort by createdAt descending
    return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function getNoteById(id: string): Promise<Note | null> {
  const notes = await getAllNotes();
  return notes.find(n => n.id === id) || null;
}

export async function updateNoteTitle(id: string, title: string): Promise<void> {
  const notes = await getAllNotes();
  const noteIndex = notes.findIndex(n => n.id === id);
  
  if (noteIndex >= 0) {
    notes[noteIndex].title = title;
    notes[noteIndex].updatedAt = new Date().toISOString();
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await getAllNotes();
  const filteredNotes = notes.filter(n => n.id !== id);
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SETTINGS_PREFIX + key);
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_PREFIX + key, value);
}
