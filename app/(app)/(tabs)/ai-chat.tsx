import { useSession } from '@/components/ctx'
import { Input } from '@/components/ui/input'
import Ionicons from '@expo/vector-icons/Ionicons'
import { createParser, type ParsedEvent, type ReconnectInterval } from 'eventsource-parser'
import React, { useCallback, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8089'
const STREAM_PATH = '/api/todos/agent-create/stream'

export default function AIChatScreen() {
  const { session } = useSession()
  const [inputText, setInputText] = useState('')
  const [isLogging, setIsLogging] = useState(false)

  const logStreamToConsole = useCallback(async () => {
    if (!session) {
      Alert.alert('Authentication Required', 'Please sign in to use the AI stream.')
      return
    }

    const cleanText = inputText.trim()
    if (!cleanText) {
      Alert.alert('Missing Message', 'Enter a message before starting the stream.')
      return
    }

    const requestBody = {
      messages: [
        {
          role: 'user',
          content: cleanText,
        },
      ],
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session}`,
    }

    console.log('Starting SSE console log stream...')
    setIsLogging(true)

    try {
      const response = await fetch(`${API_BASE}${STREAM_PATH}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Stream log request failed (${response.status})`)
      }

      const reader = response.body?.getReader()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      const decoder = new TextDecoder()
      const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
        if (event.type !== 'event') return

        const data = typeof event.data === 'string' ? event.data.trim() : ''
        if (!data) return
        if (data === '[DONE]') {
          console.log('SSE console log stream finished.')
          return
        }
        console.log('[SSE chunk]', data)
      })

      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          const finalChunk = decoder.decode()
          if (finalChunk) parser.feed(finalChunk)
          break
        }
        const textChunk = decoder.decode(value, { stream: true })
        parser.feed(textChunk)
      }

      reader.releaseLock()
    } catch (error) {
      console.error('Error while logging SSE stream:', error)
      Alert.alert('Error', 'Failed to stream AI response. Check the console for details.')
    } finally {
      setIsLogging(false)
    }
  }, [inputText, session])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI SSE Logger</Text>
          <TouchableOpacity onPress={logStreamToConsole} style={styles.iconButton} disabled={isLogging}>
            <Ionicons name="terminal-outline" size={24} color={isLogging ? '#999' : '#34C759'} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Input
            style={styles.textInput}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLogging}
            blurOnSubmit={false}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={logStreamToConsole}
            style={[styles.sendButton, (!inputText.trim() || isLogging) && styles.sendButtonDisabled]}
            disabled={!inputText.trim() || isLogging}
          >
            <Ionicons name="send" size={20} color={!inputText.trim() || isLogging ? '#999' : '#FFF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  iconButton: {
    padding: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#DDD',
  },
})
