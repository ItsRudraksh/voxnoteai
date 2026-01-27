import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/useTheme';
import { useApp } from '../../src/contexts/AppContext';
import { AudioPlayer } from '../../src/components/AudioPlayer';
import { getNoteById } from '../../src/storage/database';
import { Note } from '../../src/types/note';
import { formatDate, formatTimestamp, formatDuration } from '../../src/utils/formatters';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { notes, updateTitle, deleteNote } = useApp();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    if (!id) return;

    // First try from context
    const contextNote = notes.find(n => n.id === id);
    if (contextNote) {
      setNote(contextNote);
      setEditedTitle(contextNote.title);
      setIsLoading(false);
      return;
    }

    // Otherwise load from database
    const dbNote = await getNoteById(id);
    if (dbNote) {
      setNote(dbNote);
      setEditedTitle(dbNote.title);
    }
    setIsLoading(false);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleSaveTitle = async () => {
    if (!note || !editedTitle.trim()) return;
    
    await updateTitle(note.id, editedTitle.trim());
    setNote(prev => prev ? { ...prev, title: editedTitle.trim() } : null);
    setIsEditingTitle(false);
  };

  const handleDeleteNote = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (note) {
              await deleteNote(note.id);
              router.replace('/timeline');
            }
          },
        },
      ]
    );
  };

  const getSentimentInfo = () => {
    if (!note?.sentiment) return null;
    const { sentiment, confidence } = note.sentiment;
    const icons: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
      positive: { name: 'happy-outline', color: colors.success },
      negative: { name: 'sad-outline', color: colors.error },
      neutral: { name: 'remove-outline', color: colors.textMuted },
    };
    return {
      ...icons[sentiment],
      label: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      confidence: Math.round(confidence * 100),
    };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Note not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const sentimentInfo = getSentimentInfo();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDeleteNote}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          {isEditingTitle ? (
            <View style={styles.titleEditContainer}>
              <TextInput
                style={[styles.titleInput, { color: colors.text, borderColor: colors.primary }]}
                value={editedTitle}
                onChangeText={setEditedTitle}
                autoFocus
                selectTextOnFocus
                onBlur={handleSaveTitle}
                onSubmitEditing={handleSaveTitle}
              />
              <TouchableOpacity style={styles.saveTitleButton} onPress={handleSaveTitle}>
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
              <Text style={[styles.title, { color: colors.text }]}>{note.title}</Text>
              <View style={styles.titleHint}>
                <Ionicons name="pencil-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.titleHintText, { color: colors.textMuted }]}>
                  Tap to edit
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Meta info */}
        <View style={styles.metaRow}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(note.createdAt)} at {formatTimestamp(note.createdAt)}
          </Text>
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.durationText, { color: colors.textMuted }]}>
              {formatDuration(note.duration)}
            </Text>
          </View>
        </View>

        {/* Summary */}
        {note.summary && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
            </View>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              {note.summary}
            </Text>
          </View>
        )}

        {/* Topics & Sentiment */}
        <View style={styles.chipsContainer}>
          {note.topics.length > 0 && (
            <View style={styles.chipsSection}>
              <Text style={[styles.chipsLabel, { color: colors.textMuted }]}>Topics</Text>
              <View style={styles.chips}>
                {note.topics.map((topic, index) => (
                  <View
                    key={index}
                    style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}
                  >
                    <Text style={[styles.chipText, { color: colors.primary }]}>
                      {topic.topic}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {sentimentInfo && (
            <View style={styles.chipsSection}>
              <Text style={[styles.chipsLabel, { color: colors.textMuted }]}>Sentiment</Text>
              <View style={styles.chips}>
                <View style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name={sentimentInfo.name} size={16} color={sentimentInfo.color} />
                  <Text style={[styles.chipText, { color: sentimentInfo.color }]}>
                    {sentimentInfo.label}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {note.intent && (
            <View style={styles.chipsSection}>
              <Text style={[styles.chipsLabel, { color: colors.textMuted }]}>Intent</Text>
              <View style={styles.chips}>
                <View style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="bulb-outline" size={16} color={colors.accent} />
                  <Text style={[styles.chipText, { color: colors.accent }]}>
                    {note.intent.intent}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Audio Player */}
        {note.audioPath && (
          <View style={styles.audioSection}>
            <Text style={[styles.audioLabel, { color: colors.textMuted }]}>Original Recording</Text>
            <AudioPlayer uri={note.audioPath} duration={note.duration} />
          </View>
        )}

        {/* Full Transcript */}
        <View style={[styles.transcriptSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.transcriptHeader}
            onPress={() => setShowFullTranscript(!showFullTranscript)}
          >
            <View style={styles.transcriptHeaderLeft}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Transcript</Text>
            </View>
            <Ionicons
              name={showFullTranscript ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
          {showFullTranscript && (
            <Text style={[styles.transcriptText, { color: colors.textSecondary }]}>
              {note.transcript}
            </Text>
          )}
          {!showFullTranscript && (
            <Text
              style={[styles.transcriptText, { color: colors.textSecondary }]}
              numberOfLines={3}
            >
              {note.transcript}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  titleEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    borderBottomWidth: 2,
    paddingVertical: 4,
  },
  saveTitleButton: {
    padding: 8,
  },
  titleHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  titleHintText: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
  },
  chipsContainer: {
    marginBottom: 20,
  },
  chipsSection: {
    marginBottom: 12,
  },
  chipsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  audioSection: {
    marginBottom: 20,
  },
  audioLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  transcriptSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transcriptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
});
