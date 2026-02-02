import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/theme/useTheme';
import { useApp } from '../src/contexts/AppContext';
import { NoteCard } from '../src/components/NoteCard';
import { AuroraBackground } from '../src/components/AuroraBackground';
import { Note } from '../src/types/note';
import { formatDate } from '../src/utils/formatters';

export default function TimelineScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { notes, refreshNotes, isLoading } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  // Group notes by date
  const groupedNotes = React.useMemo(() => {
    const groups: { date: string; notes: Note[] }[] = [];
    let currentDate = '';

    for (const note of notes) {
      const noteDate = new Date(note.createdAt).toDateString();
      if (noteDate !== currentDate) {
        currentDate = noteDate;
        groups.push({ date: note.createdAt, notes: [note] });
      } else {
        groups[groups.length - 1].notes.push(note);
      }
    }

    return groups;
  }, [notes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotes();
    setRefreshing(false);
  }, [refreshNotes]);

  const handleNotePress = (note: Note) => {
    router.push(`/note/${note.id}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleNewNote = () => {
    router.push('/home');
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No notes yet</Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Start recording to capture your first voice note
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={handleNewNote}
      >
        <Ionicons name="mic-outline" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Record Note</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: { date: string; notes: Note[] } }) => (
    <View style={styles.dateGroup}>
      <Text style={[styles.dateHeader, { color: colors.textMuted }]}>
        {formatDate(item.date)}
      </Text>
      {item.notes.map(note => (
        <NoteCard key={note.id} note={note} onPress={() => handleNotePress(note)} />
      ))}
    </View>
  );

  return (
    <AuroraBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Your Notes</Text>
          <View style={styles.headerRight}>
            <Text style={[styles.noteCount, { color: colors.textMuted }]}>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </Text>
          </View>
        </View>

        {/* Notes List */}
        {notes.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={groupedNotes}
            keyExtractor={item => item.date}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          />
        )}

        {/* FAB for new note */}
        {notes.length > 0 && (
          <TouchableOpacity
            style={styles.fabContainer}
            onPress={handleNewNote}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.micGradientStart, colors.micGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fab}
            >
              <Ionicons name="mic" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  noteCount: {
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  dateGroup: {
    marginBottom: 8,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
