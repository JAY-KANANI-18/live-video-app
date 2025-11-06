import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { Message } from '../../services/chatService';

export default function ChatRoomScreen({ route, navigation }: any) {
  const { roomId, displayName } = route.params;
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuthStore();
  const {
    messages,
    typingUsers,
    joinRoom,
    leaveRoom,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    sendTyping,
    markAsRead,
  } = useChatStore();

  const roomMessages = messages.get(roomId) || [];
  const roomTyping = Array.from(typingUsers.get(roomId) || []);
  const othersTyping = roomTyping.filter((userId) => userId !== user?.id);

  useEffect(() => {
    // Set navigation title
    navigation.setOptions({ title: displayName });

    // Join room and load messages
    joinRoom(roomId);
    loadMessages(roomId);

    // Mark as read when screen is focused
    const timer = setTimeout(() => {
      markAsRead(roomId);
    }, 500);

    return () => {
      clearTimeout(timer);
      leaveRoom(roomId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId]);

  // Mark as read when new messages arrive (debounced)
  useEffect(() => {
    if (roomMessages.length > 0) {
      const timer = setTimeout(() => {
        markAsRead(roomId);
      }, 1000); // Wait 1 second before marking as read
      
      return () => clearTimeout(timer);
    }
  }, [roomMessages.length, roomId]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    sendMessage(roomId, inputText.trim());
    setInputText('');
    setIsTyping(false);
    sendTyping(roomId, false);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    // Only send typing indicator if WebSocket is connected
    if (!text.trim()) {
      if (isTyping) {
        setIsTyping(false);
        sendTyping(roomId, false);
      }
      return;
    }

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(roomId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(roomId, false);
    }, 2000);
  };

  const handleLoadMore = async () => {
    if (loadingMore || roomMessages.length === 0) return;

    setLoadingMore(true);
    await loadMoreMessages(roomId);
    setLoadingMore(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === user?.id;
    const showAvatar = index === 0 || roomMessages[index - 1]?.senderId !== item.senderId;
    const showTime = index === roomMessages.length - 1 ||
      roomMessages[index + 1]?.senderId !== item.senderId;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.messageContainerOwn : styles.messageContainerOther,
        ]}
      >
        {!isOwnMessage && showAvatar && (
          <View style={styles.messageAvatar}>
            <Text style={styles.messageAvatarText}>
              {item.sender.displayName?.[0] || item.sender.username[0]}
            </Text>
          </View>
        )}
        {!isOwnMessage && !showAvatar && <View style={styles.messageAvatarSpacer} />}

        <View style={styles.messageContent}>
          {!isOwnMessage && showAvatar && (
            <Text style={styles.messageSender}>
              {item.sender.displayName || item.sender.username}
            </Text>
          )}
          <View
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isOwnMessage ? styles.messageTextOwn : styles.messageTextOther,
              ]}
            >
              {item.content}
            </Text>
          </View>
          {showTime && (
            <Text
              style={[
                styles.messageTime,
                isOwnMessage && styles.messageTimeOwn,
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (othersTyping.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
        <Text style={styles.typingText}>typing...</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={roomMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : null
        }
        ListFooterComponent={renderTypingIndicator()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
        onContentSizeChange={() => {
          if (roomMessages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesList: {
    padding: 16,
  },
  loadingMore: {
    padding: 16,
    alignItems: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageContainerOwn: {
    justifyContent: 'flex-end',
  },
  messageContainerOther: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageAvatarSpacer: {
    width: 40,
  },
  messageContent: {
    maxWidth: '70%',
  },
  messageSender: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleOwn: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
  },
  messageTextOwn: {
    color: '#fff',
  },
  messageTextOther: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    marginLeft: 12,
  },
  messageTimeOwn: {
    textAlign: 'right',
    marginRight: 12,
    marginLeft: 0,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  typingBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginLeft: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginHorizontal: 2,
  },
  typingDot1: {
    animationDelay: '0s',
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  typingText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});
