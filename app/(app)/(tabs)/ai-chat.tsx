import { useSession } from '@/components/ctx'
import { Input } from '@/components/ui/input'
import Ionicons from '@expo/vector-icons/Ionicons'
import { createParser, type ParsedEvent, type ReconnectInterval } from 'eventsource-parser'
import React, { useCallback, useRef, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Markdown from 'react-native-markdown-display'
import { SafeAreaView } from 'react-native-safe-area-context'

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8089'
const STREAM_PATH = '/api/todos/agent-create/stream'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatScreen() {
  const { session } = useSession()
  const [inputText, setInputText] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const scrollViewRef = useRef<ScrollView>(null)

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

    console.log('Starting SSE stream...')
    setIsLogging(true)

    // Add user message to history
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: cleanText,
    }
    setMessages(prev => [...prev, userMessage])
    setInputText('')

    // Prepare assistant message placeholder
    const assistantMessageId = `${Date.now()}-assistant`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch(`${API_BASE}${STREAM_PATH}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Stream request failed (${response.status})`)
      }

      const reader = response.body?.getReader()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      const decoder = new TextDecoder()
      let accumulatedContent = ''

      const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
        if (event.type !== 'event') return

        const data = typeof event.data === 'string' ? event.data.trim() : ''
        if (!data) return
        if (data === '[DONE]') {
          console.log('SSE stream finished.')
          return
        }

        try {
          const parsed = JSON.parse(data)

          // Extract content from various response formats
          if (parsed.content && typeof parsed.content === 'string') {
            accumulatedContent += parsed.content
            // Update the assistant message in the history
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
              )
            )
          } else if (parsed.output && typeof parsed.output === 'string') {
            accumulatedContent += '\n' + parsed.output
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
              )
            )
          }

          console.log('[SSE chunk]', data)
        } catch {
          // If not valid JSON, just log it
          console.log('[SSE chunk]', data)
        }
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
      console.error('Error while streaming:', error)
      Alert.alert('Error', 'Failed to stream AI response. Check the console for details.')
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
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
          <Text style={styles.headerTitle}>AI Chat</Text>
          <TouchableOpacity
            onPress={() => setMessages([])}
            style={styles.iconButton}
            disabled={isLogging}
          >
            <Ionicons name="trash-outline" size={24} color={isLogging ? '#999' : '#FF3B30'} />
          </TouchableOpacity>
        </View>

        {/* Messages Display */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.contentContainer}
          contentContainerStyle={styles.contentInner}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length > 0 ? (
            messages.map(message => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Markdown>
                    {message.content}
                  </Markdown>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>Send a message to start chatting</Text>
            </View>
          )}
        </ScrollView>

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
            {isLogging ? (
              <Ionicons name="stop-circle" size={20} color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color={!inputText.trim() ? '#999' : '#FFF'} />
            )}
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
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  assistantText: {
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
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
