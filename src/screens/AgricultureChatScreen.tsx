import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import ProfessionalCard from '../components/ProfessionalCard';
import GeminiAIService, { AgricultureAdvice } from '../services/GeminiAIService';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  advice?: AgricultureAdvice;
}

const AgricultureChatScreen = () => {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickQuestions = [
    "How to increase crop yield?",
    "Best time to plant tomatoes?",
    "Organic pest control methods",
    "Water management techniques",
    "Soil health improvement",
    "Market price predictions",
    "Weather farming advice",
    "Crop disease identification"
  ];

  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      text: "🌱 Welcome to AgroSense AI! I'm your agricultural assistant. I can help with farming advice, crop diseases, weather guidance, and market insights. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputText.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const advice = await GeminiAIService.getAgriculturalAdvice(text, {
        location: 'India',
        cropType: 'Mixed',
        farmSize: 'Small scale',
        experience: 'Intermediate',
        language: 'English'
      });
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: advice.recommendation,
        isUser: false,
        timestamp: new Date(),
        advice,
      };

      setMessages(prev => [...prev, aiMessage]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble processing your request. Please check your Gemini API key configuration and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuickButton = (question: string, index: number) => (
    <TouchableOpacity
      key={`quick-${index}`}
      style={[styles.quickButton, { backgroundColor: colors.border, borderColor: colors.primary }]}
      onPress={() => sendMessage(question)}
    >
      <Text style={[styles.quickButtonText, { color: colors.primary }]}>{question}</Text>
    </TouchableOpacity>
  );

  const renderMessage = (message: ChatMessage) => {
    const userBubbleColor = message.isUser ? (isDark ? colors.primary : '#007AFF') : colors.surface;
    
    return (
    <View 
      key={message.id}
      style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.aiBubble,
        { 
          backgroundColor: userBubbleColor,
          borderColor: colors.border 
        }
      ]}
    >
      <Text style={[
        styles.messageText,
        { color: message.isUser ? '#FFFFFF' : colors.text }
      ]}>
        {message.text}
      </Text>
      
      {message.advice && (
        <View style={[styles.adviceContainer, { backgroundColor: colors.border }]}>
          <View style={styles.adviceHeader}>
            <Icon name="lightbulb" size={16} color={colors.warning} />
            <Text style={[styles.adviceTitle, { color: colors.text }]}>Detailed Advice</Text>
          </View>
          
          {message.advice.reasoning && (
            <Text style={[styles.adviceReason, { color: colors.textMuted }]}>
              💡 {message.advice.reasoning}
            </Text>
          )}
          
          {message.advice.actionItems && message.advice.actionItems.length > 0 && (
            <View style={styles.actionItems}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Action Steps:</Text>
              {message.advice.actionItems.map((action, actionIndex) => (
                <Text key={`action-${actionIndex}`} style={[styles.actionItem, { color: colors.textMuted }]}>
                  {actionIndex + 1}. {action}
                </Text>
              ))}
            </View>
          )}
          
          {message.advice.urgency && (
            <View style={[styles.urgencyBadge, {
              backgroundColor: message.advice.urgency === 'high' ? colors.error + '20' : 
                             message.advice.urgency === 'medium' ? colors.warning + '20' : colors.success + '20'
            }]}>
              <Text style={[styles.urgencyText, {
                color: message.advice.urgency === 'high' ? colors.error : 
                       message.advice.urgency === 'medium' ? colors.warning : colors.success
              }]}>
                {message.advice.urgency.toUpperCase()} PRIORITY
              </Text>
            </View>
          )}
        </View>
      )}
      
      <Text style={[styles.timestamp, { color: message.isUser ? '#FFFFFF80' : colors.textMuted }]}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.statusBar} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>🤖 AI Farm Assistant</Text>
          <TouchableOpacity 
            style={[styles.clearButton, { backgroundColor: colors.border }]}
            onPress={() => {
              setMessages([{
                id: '1',
                text: "🌱 Chat cleared! How can I help you with your farming today?",
                isUser: false,
                timestamp: new Date(),
              }]);
            }}
          >
            <Icon name="broom" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Ask me anything about farming, crops, weather, or market prices
        </Text>
      </View>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <ProfessionalCard
          title="Quick Questions"
          subtitle="Tap to ask common farming questions"
          icon="help-circle"
          iconColor={colors.info}
          style={styles.quickCard}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            {quickQuestions.map((question, index) => renderQuickButton(question, index))}
          </ScrollView>
        </ProfessionalCard>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        
        {isLoading && (
          <View style={[styles.loadingBubble, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={[styles.inputRow, { backgroundColor: isDark ? colors.background : '#F8F9FA' }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about farming..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, { 
              backgroundColor: inputText.trim() ? colors.primary : colors.textMuted 
            }]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <Icon name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCard: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  quickScroll: {
    marginTop: 12,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  adviceContainer: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  adviceTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  adviceReason: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  actionItems: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionItem: {
    fontSize: 11,
    marginBottom: 2,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default AgricultureChatScreen;