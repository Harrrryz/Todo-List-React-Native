import { useSession } from '@/components/ctx';
import { Input } from '@/components/ui/input';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type StreamEvent = {
  id: string;
  payload: string;
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8089';
const STREAM_PATH = '/api/todos/agent-create/stream';

export default function ChatStreamTest() {
  const { session } = useSession();
  const [prompt, setPrompt] = useState('Create a reminder to call Alex about the Q4 forecast.');
  const [sessionId, setSessionId] = useState<string>('');
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'streaming' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const bufferRef = useRef('');
  const scrollViewRef = useRef<ScrollView>(null);

  const resetState = useCallback(() => {
    setEvents([]);
    setStatus('idle');
    setError(null);
    setLastDurationMs(null);
  }, []);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const appendEvent = useCallback((payload: string) => {
    setEvents(prev => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        payload,
      },
    ]);
  }, []);

  const consumeBuffer = useCallback(() => {
    let separatorIndex = bufferRef.current.indexOf('\n\n');

    while (separatorIndex !== -1) {
      const rawEvent = bufferRef.current.slice(0, separatorIndex);
      bufferRef.current = bufferRef.current.slice(separatorIndex + 2);

      const dataLines = rawEvent
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .map(line => line.replace(/^data:\s?/, ''));

      if (dataLines.length > 0) {
        appendEvent(dataLines.join('\n'));
      }

      separatorIndex = bufferRef.current.indexOf('\n\n');
    }
  }, [appendEvent]);

  const streamChat = useCallback(async () => {
    if (!prompt.trim() || isStreaming) {
      return;
    }

    if (!session) {
      setError('No active session token found. Please sign in before starting a stream.');
      setStatus('error');
      return;
    }

    resetState();
    setIsStreaming(true);
    setStatus('connecting');
    startTimeRef.current = Date.now();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const body = {
        messages: [
          {
            role: 'user',
            content: prompt.trim(),
          },
        ],
        sessionid: sessionId.trim() || undefined,
        sessionname: sessionId.trim() ? undefined : 'Chat Stream Test',
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      };

      const response = await fetch(`${API_BASE}${STREAM_PATH}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Stream request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error('Response body is not readable');
      }

      setStatus('streaming');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        bufferRef.current += decoder.decode(value, { stream: true });
        consumeBuffer();
      }

      bufferRef.current += decoder.decode();
      consumeBuffer();

      setStatus('done');
      setLastDurationMs(Date.now() - startTimeRef.current);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        appendEvent('[stream cancelled]');
      } else {
        console.error('Chat stream error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    } finally {
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, [appendEvent, consumeBuffer, isStreaming, prompt, resetState, session, sessionId]);

  useEffect(() => {
    if (events.length === 0) {
      return;
    }

    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [events]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Chat Stream Debug</Text>
          <Text style={styles.subtitle}>
            POST {STREAM_PATH}
          </Text>
          <Text style={styles.baseUrl}>Base URL: {API_BASE}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Prompt</Text>
            <Input
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              className="native:h-[140px]"
              style={styles.textArea}
              placeholder="Describe the task you want the agent to process"
              editable={!isStreaming}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Session ID (optional)</Text>
            <Input
              value={sessionId}
              onChangeText={setSessionId}
              placeholder="existing-session-id"
              autoCapitalize="none"
              editable={!isStreaming}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, !prompt.trim() || isStreaming ? styles.buttonDisabled : undefined]}
              onPress={streamChat}
              disabled={!prompt.trim() || isStreaming}
            >
              <Text style={styles.buttonText}>Start Stream</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, !isStreaming ? styles.buttonDisabled : undefined]}
              onPress={handleStop}
              disabled={!isStreaming}
            >
              <Text style={styles.secondaryButtonText}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={resetState}
              disabled={isStreaming}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status: {status}</Text>
            {isStreaming && <ActivityIndicator size="small" color="#007AFF" />}
            {lastDurationMs != null && (
              <Text style={styles.statusLabel}>Duration: {lastDurationMs}ms</Text>
            )}
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Stream Output</Text>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            {events.length === 0 && (
              <Text style={styles.placeholder}>Streamed chunks will appear here.</Text>
            )}
            {events.map(event => (
              <View key={event.id} style={styles.logEntry}>
                <Text style={styles.eventText}>{event.payload}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6C6C70',
  },
  baseUrl: {
    marginTop: 2,
    fontSize: 12,
    color: '#8E8E93',
  },
  form: {
    paddingHorizontal: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6C6C70',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginBottom: 8,
  },
  logContainer: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  placeholder: {
    color: '#AEAEB2',
    fontSize: 14,
  },
  logEntry: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  eventText: {
    color: '#1C1C1E',
    fontSize: 14,
  },
});