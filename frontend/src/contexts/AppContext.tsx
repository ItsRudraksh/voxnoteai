import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Note } from '../types/note';
import { initDatabase, getAllNotes, saveNote, deleteNote as deleteNoteFromDB, updateNoteTitle, getSetting, setSetting } from '../storage/database';
import { deleteAudioFile } from '../services/audio';

interface AppContextType {
  notes: Note[];
  isLoading: boolean;
  isOnboarded: boolean;
  addNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateTitle: (id: string, title: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initDatabase();
      const [loadedNotes, onboarded] = await Promise.all([
        getAllNotes(),
        getSetting('onboarded'),
      ]);
      setNotes(loadedNotes);
      setIsOnboarded(onboarded === 'true');
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotes = useCallback(async () => {
    const loadedNotes = await getAllNotes();
    setNotes(loadedNotes);
  }, []);

  const addNote = useCallback(async (note: Note) => {
    await saveNote(note);
    setNotes(prev => [note, ...prev]);
  }, []);

  const deleteNoteHandler = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note?.audioPath) {
      await deleteAudioFile(note.audioPath);
    }
    await deleteNoteFromDB(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [notes]);

  const updateTitle = useCallback(async (id: string, title: string) => {
    await updateNoteTitle(id, title);
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, title, updatedAt: new Date().toISOString() } : n
    ));
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setSetting('onboarded', 'true');
    setIsOnboarded(true);
  }, []);

  return (
    <AppContext.Provider
      value={{
        notes,
        isLoading,
        isOnboarded,
        addNote,
        deleteNote: deleteNoteHandler,
        updateTitle,
        refreshNotes,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
