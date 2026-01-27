import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { Note } from '../types/note';
import { formatRelativeTime, formatDuration, truncateText } from '../utils/formatters';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export function NoteCard({ note, onPress }: NoteCardProps) {
  const { colors } = useTheme();

  const getSentimentIcon = () => {
    if (!note.sentiment) return null;
    switch (note.sentiment.sentiment) {
      case 'positive':
        return <Ionicons name="happy-outline" size={14} color={colors.success} />;
      case 'negative':
        return <Ionicons name="sad-outline" size={14} color={colors.error} />;
      default:
        return <Ionicons name="remove-outline" size={14} color={colors.textMuted} />;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {note.title}
        </Text>
        <View style={styles.meta}>
          {getSentimentIcon()}
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatRelativeTime(note.createdAt)}
          </Text>
        </View>
      </View>

      {note.summary ? (
        <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
          {note.summary}
        </Text>
      ) : (
        <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
          {truncateText(note.transcript, 100)}
        </Text>
      )}

      <View style={styles.footer}>
        {note.topics.length > 0 && (
          <View style={styles.topics}>
            {note.topics.slice(0, 2).map((topic, index) => (
              <View
                key={index}
                style={[styles.topicChip, { backgroundColor: colors.surfaceAlt }]}
              >
                <Text style={[styles.topicText, { color: colors.primary }]}>
                  {topic.topic}
                </Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.duration}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.durationText, { color: colors.textMuted }]}>
            {formatDuration(note.duration)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topics: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  topicChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicText: {
    fontSize: 12,
    fontWeight: '500',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
});
