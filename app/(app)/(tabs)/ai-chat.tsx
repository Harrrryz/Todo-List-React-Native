import { useSession } from '@/components/ctx'
import { Input } from '@/components/ui/input'
import Ionicons from '@expo/vector-icons/Ionicons'
import { createParser, type ParsedEvent, type ReconnectInterval } from 'eventsource-parser'
import React, { useCallback, useRef, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import * as RNLocalize from 'react-native-localize'
import Markdown from 'react-native-markdown-display'
import { SafeAreaView } from 'react-native-safe-area-context'

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8089'
const STREAM_PATH = '/api/todos/agent-create/stream'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Agent {
  id: string
  name: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
}

const AVAILABLE_AGENTS: Agent[] = [
  {
    id: 'TodoAssistant',
    name: 'Todo Assistant',
    description: 'General todo management assistant',
    icon: 'checkbox-outline',
  },
  {
    id: 'TodoCrudAssistant',
    name: 'Todo CRUD Assistant',
    description: 'Create, read, update, and delete todos',
    icon: 'create-outline',
  },
  {
    id: 'TodoScheduleAssistant',
    name: 'Todo Schedule Assistant',
    description: 'Help with scheduling and organizing todos',
    icon: 'calendar-outline',
  },
  {
    id: 'TodoSupportAssistant',
    name: 'Todo Support Assistant',
    description: 'Get help and support with your todos',
    icon: 'help-circle-outline',
  },
  {
    id: 'TodoOrchestratorAgent',
    name: 'Todo Orchestrator',
    description: 'Coordinates multiple agents for complex tasks',
    icon: 'git-network-outline',
  },
]

export default function AIChatScreen() {
  const { session } = useSession()
  const [inputText, setInputText] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AVAILABLE_AGENTS[0])
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
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

    const userTimezone = RNLocalize.getTimeZone()
    const requestBody: {
      messages: { role: string; content: string }[]
      agentname: string
      session_id?: string
    } = {
      messages: [
        {
          role: 'user',
          content: `[Timezone: ${userTimezone}] ${cleanText}`,
        },
      ],
      agentname: selectedAgent.id,
    }

    // Include session_id if we have one from a previous response
    if (sessionId) {
      requestBody.session_id = sessionId
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

          // Extract session_id from response if present (first message of a new session)
          if (parsed.session_id && typeof parsed.session_id === 'string') {
            setSessionId(parsed.session_id)
          }

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
  }, [inputText, session, selectedAgent.id, sessionId])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>AI Chat</Text>
            <TouchableOpacity
              onPress={() => setShowAgentSelector(true)}
              style={styles.agentSelector}
              disabled={isLogging}
            >
              <Ionicons name={selectedAgent.icon} size={16} color="#007AFF" />
              <Text style={styles.agentSelectorText}>{selectedAgent.name}</Text>
              <Ionicons name="chevron-down" size={14} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              setMessages([])
              setSessionId(null)
            }}
            style={styles.iconButton}
            disabled={isLogging}
          >
            <Ionicons name="trash-outline" size={24} color={isLogging ? '#999' : '#FF3B30'} />
          </TouchableOpacity>
        </View>

        {/* Agent Selector Modal */}
        <Modal
          visible={showAgentSelector}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAgentSelector(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAgentSelector(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Agent</Text>
              {AVAILABLE_AGENTS.map(agent => (
                <TouchableOpacity
                  key={agent.id}
                  style={[
                    styles.agentOption,
                    selectedAgent.id === agent.id && styles.agentOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedAgent(agent)
                    setShowAgentSelector(false)
                  }}
                >
                  <View style={styles.agentOptionLeft}>
                    <View style={[
                      styles.agentIconContainer,
                      selectedAgent.id === agent.id && styles.agentIconContainerSelected,
                    ]}>
                      <Ionicons
                        name={agent.icon}
                        size={20}
                        color={selectedAgent.id === agent.id ? '#FFF' : '#007AFF'}
                      />
                    </View>
                    <View style={styles.agentInfo}>
                      <Text style={[
                        styles.agentOptionName,
                        selectedAgent.id === agent.id && styles.agentOptionNameSelected,
                      ]}>
                        {agent.name}
                      </Text>
                      <Text style={styles.agentOptionDescription}>{agent.description}</Text>
                    </View>
                  </View>
                  {selectedAgent.id === agent.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

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
  headerLeft: {
    flex: 1,
  },
  agentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  agentSelectorText: {
    fontSize: 12,
    color: '#007AFF',
    marginHorizontal: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  agentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  agentOptionSelected: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  agentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentIconContainerSelected: {
    backgroundColor: '#007AFF',
  },
  agentInfo: {
    flex: 1,
  },
  agentOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  agentOptionNameSelected: {
    color: '#007AFF',
  },
  agentOptionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
})
