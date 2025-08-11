import { agentCreateTodo, AgentCreateTodoData, AgentTodoRequest } from '@/client';
import { Input } from '@/components/ui/input';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);


  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Prepare the messages array for the agent
      const messagesForAgent = messages
        .filter(msg => msg.id !== '1') // Exclude the initial greeting
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
          // timestamp: msg.timestamp.toISOString(),
        }));

      // Add the current user message
      messagesForAgent.push({
        role: 'user',
        content: userMessage,
        // timestamp: new Date().toISOString(),
      });

      const agentRequest: AgentTodoRequest = {
        messages: messagesForAgent,
      };

      const agentData: AgentCreateTodoData = {
        body: agentRequest,
        url: '/todos/agent-create',
      };

      const response = await agentCreateTodo(agentData);

      if (response.data && response.data.message) {
        return response.data.message;
      } else if (response.data && response.data.agent_response && response.data.agent_response.length > 0) {
        // If there's an agent_response array, try to extract a message from it
        const agentResponseContent = response.data.agent_response[0];
        if (typeof agentResponseContent === 'object' && agentResponseContent !== null) {
          // Try to find a message or content field
          const content = (agentResponseContent as any).content ||
            (agentResponseContent as any).message ||
            (agentResponseContent as any).text ||
            JSON.stringify(agentResponseContent);
          return typeof content === 'string' ? content : 'I received your message but had trouble formatting the response.';
        }
        return 'I processed your request successfully.';
      } else {
        return 'I received your message but didn\'t get a proper response from the AI service.';
      }
    } catch (error) {
      console.error('Error calling agentCreateTodo:', error);
      // Fallback to a simple response
      return 'I\'m sorry, I\'m having trouble connecting to the AI service right now. Please try again later.';
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim() + ' (sent at timezone: ' + Intl.DateTimeFormat().resolvedOptions().timeZone + ')',
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(userMessage.text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      Alert.alert('Error', 'Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([{
              id: '1',
              text: 'Hello! I\'m your AI assistant. How can I help you today?',
              isUser: false,
              timestamp: new Date(),
            }]);
          },
        },
      ]
    );
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.aiBubble,
      ]}>
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userText : styles.aiText,
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.timestamp,
          message.isUser ? styles.userTimestamp : styles.aiTimestamp,
        ]}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>AI is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputContainer}>
          <Input
            style={styles.textInput}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={(!inputText.trim() || isLoading) ? '#999' : '#FFF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
  clearButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 5,
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
  aiText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#999',
  },
  loadingText: {
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 10,
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
});
