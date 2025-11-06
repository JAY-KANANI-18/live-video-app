import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { walletService, Transaction } from '../../services/walletService';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async (offset = 0) => {
    try {
      setLoading(true);
      const data = await walletService.getTransactions(50, offset);
      setTransactions(offset === 0 ? data.transactions : [...transactions, ...data.transactions]);
      setHasMore(data.transactions.length === 50);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions(0);
    setRefreshing(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return '⬆️';
      case 'GIFT_SENT':
        return '🎁➡️';
      case 'GIFT_RECEIVED':
        return '🎁⬅️';
      case 'WITHDRAWAL':
        return '💰';
      case 'REFUND':
        return '↩️';
      default:
        return '💎';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
      case 'GIFT_RECEIVED':
      case 'REFUND':
        return '#10b981'; // green
      case 'GIFT_SENT':
      case 'WITHDRAWAL':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = ['PURCHASE', 'GIFT_RECEIVED', 'REFUND'].includes(item.type);
    const color = getTransactionColor(item.type);

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionIcon}>
          <Text style={styles.iconEmoji}>{getTransactionIcon(item.type)}</Text>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>{item.type.replace('_', ' ')}</Text>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description || 'Transaction'}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, { color }]}>
            {isCredit ? '+' : '-'}
            {item.currency === 'DIAMONDS' ? '💎' : '₹'} {item.amount}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'COMPLETED' ? '#d1fae5' : '#fee2e2' }]}>
            <Text style={[styles.statusText, { color: item.status === 'COMPLETED' ? '#065f46' : '#991b1b' }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Your transaction history will appear here
            </Text>
          </View>
        }
        onEndReached={() => {
          if (hasMore && !loading) {
            loadTransactions(transactions.length);
          }
        }}
        onEndReachedThreshold={0.5}
      />
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
  listContent: {
    padding: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
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
