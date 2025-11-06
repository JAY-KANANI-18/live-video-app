import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { walletService, WalletBalance } from '../../services/walletService';
import { useAuthStore } from '../../store/authStore';

export default function WalletScreen({ navigation }: any) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, refreshProfile } = useAuthStore();

  useEffect(() => {
    loadBalance();
  }, []);

  // Refresh on screen focus
  useFocusEffect(
    React.useCallback(() => {
      loadBalance();
      refreshProfile();
    }, [])
  );

  const loadBalance = async () => {
    try {
      setLoading(true);
      const data = await walletService.getBalance();
      setBalance(data);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBalance();
    setRefreshing(false);
  };

  if (loading && !balance) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Diamond Balance</Text>
        <View style={styles.diamondRow}>
          <Text style={styles.diamondIcon}>💎</Text>
          <Text style={styles.balanceAmount}>{balance?.diamonds || 0}</Text>
        </View>
        <Text style={styles.balanceSubtext}>
          ≈ ₹{walletService.diamondsToINR(balance?.diamonds || 0).toFixed(2)}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Topup')}
        >
          <Text style={styles.actionIcon}>⬆️</Text>
          <Text style={styles.actionText}>Top Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SendGift')}
        >
          <Text style={styles.actionIcon}>🎁</Text>
          <Text style={styles.actionText}>Send Gift</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Transactions')}
        >
          <Text style={styles.actionIcon}>📜</Text>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Host Wallet (if user is host) */}
      {user?.isHost && balance?.wallet && (
        <View style={styles.hostWallet}>
          <Text style={styles.sectionTitle}>Host Wallet</Text>

          <View style={styles.walletStat}>
            <Text style={styles.walletLabel}>Available Balance</Text>
            <Text style={styles.walletValue}>💎 {balance.wallet.availableBalance}</Text>
          </View>

          <View style={styles.walletStat}>
            <Text style={styles.walletLabel}>Pending Balance</Text>
            <Text style={styles.walletValue}>💎 {balance.wallet.pendingBalance}</Text>
          </View>

          <View style={styles.walletStat}>
            <Text style={styles.walletLabel}>Total Earned</Text>
            <Text style={styles.walletValue}>💎 {balance.wallet.totalEarned}</Text>
          </View>

          <View style={styles.walletStat}>
            <Text style={styles.walletLabel}>Total Withdrawn</Text>
            <Text style={styles.walletValue}>💎 {balance.wallet.totalWithdrawn}</Text>
          </View>

          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.withdrawButtonText}>Withdraw Earnings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 How Diamonds Work</Text>
        <Text style={styles.infoText}>• 10 Diamonds = ₹1</Text>
        <Text style={styles.infoText}>• Use diamonds to send gifts during calls</Text>
        <Text style={styles.infoText}>• Hosts earn diamonds from gifts</Text>
        <Text style={styles.infoText}>• Withdraw earnings to your bank account</Text>
      </View>
    </ScrollView>
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
    backgroundColor: '#f9fafb',
  },
  balanceCard: {
    backgroundColor: '#3b82f6',
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    color: '#bfdbfe',
    fontSize: 14,
    marginBottom: 8,
  },
  diamondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  diamondIcon: {
    fontSize: 32,
    marginRight: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  balanceSubtext: {
    color: '#bfdbfe',
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  hostWallet: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  walletStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  walletLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  walletValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  withdrawButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 6,
    lineHeight: 20,
  },
});
