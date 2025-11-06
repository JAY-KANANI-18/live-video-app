import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useChatStore } from '../../store/chatStore';
import { Room } from '../../services/chatService';

export default function ChatListScreen({ navigation }: any) {
  const {
    rooms,
    isConnected,
    initialize,
    cleanup,
    loadRooms,
  } = useChatStore();

  useEffect(() => {
    initialize();
    return () => cleanup();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadRooms();
    }, [])
  );

  const getOtherUser = (room: Room, currentUserId?: string) => {
    if (room.type === 'DIRECT') {
      return room.user1?.id === currentUserId ? room.user2 : room.user1;
    }
    return null;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderRoom = ({ item }: { item: Room }) => {
    const otherUser = getOtherUser(item);
    const displayName = item.name || otherUser?.displayName || otherUser?.username || 'Unknown';
    const hasUnread = (item.unreadCount || 0) > 0;

    return (
      <TouchableOpacity
        style={[styles.roomCard, hasUnread && styles.roomCardUnread]}
        onPress={() => navigation.navigate('ChatRoom', { roomId: item.id, displayName })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName[0].toUpperCase()}</Text>
        </View>

        <View style={styles.roomInfo}>
          <View style={styles.roomHeader}>
            <Text style={[styles.roomName, hasUnread && styles.roomNameUnread]}>
              {displayName}
            </Text>
            <Text style={styles.roomTime}>{formatTime(item.lastMessageAt)}</Text>
          </View>

          <View style={styles.roomFooter}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {item.lastMessageText || 'No messages yet'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isConnected) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.connectingText}>Connecting to chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Connection Status */}
      <View style={[styles.statusBar, isConnected ? styles.statusConnected : styles.statusDisconnected]}>
        <View style={[styles.statusDot, isConnected && styles.statusDotConnected]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={loadRooms}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              Start chatting with other users
            </Text>
          </View>
        }
      />

      {/* Floating Action Button - Disabled for now */}
      {/* TODO: Create NewChat screen for starting new conversations */}
      {/* <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewChat')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fee2e2',
  },
  statusConnected: {
    backgroundColor: '#d1fae5',
  },
  statusDisconnected: {
    backgroundColor: '#fee2e2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    color: '#374151',
  },
  listContent: {
    padding: 16,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roomCardUnread: {
    backgroundColor: '#eff6ff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  roomNameUnread: {
    fontWeight: 'bold',
  },
  roomTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  lastMessageUnread: {
    color: '#1f2937',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});
