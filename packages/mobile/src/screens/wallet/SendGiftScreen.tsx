import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { walletService } from '../../services/walletService';
import { useAuthStore } from '../../store/authStore';

const GIFT_CATALOG = [
  { id: 'rose', name: 'Rose', emoji: '🌹', diamonds: 10 },
  { id: 'heart', name: 'Heart', emoji: '❤️', diamonds: 50 },
  { id: 'cake', name: 'Cake', emoji: '🎂', diamonds: 100 },
  { id: 'ring', name: 'Ring', emoji: '💍', diamonds: 500 },
  { id: 'crown', name: 'Crown', emoji: '👑', diamonds: 1000 },
  { id: 'car', name: 'Sports Car', emoji: '🏎️', diamonds: 5000 },
  { id: 'yacht', name: 'Yacht', emoji: '🛥️', diamonds: 10000 },
  { id: 'mansion', name: 'Mansion', emoji: '🏰', diamonds: 50000 },
];

export default function SendGiftScreen({ navigation, route }: any) {
  const { receiverId, receiverName } = route.params || {};
  const [selectedGift, setSelectedGift] = useState(GIFT_CATALOG[0]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiverIdInput, setReceiverIdInput] = useState(receiverId || '');

  const { user } = useAuthStore();

  const totalDiamonds = selectedGift.diamonds * quantity;

  const handleSendGift = async () => {
    if (!receiverIdInput) {
      Alert.alert('Error', 'Please enter receiver ID');
      return;
    }

    if (receiverIdInput === user?.id) {
      Alert.alert('Error', 'Cannot send gift to yourself');
      return;
    }

    if (quantity < 1) {
      Alert.alert('Error', 'Quantity must be at least 1');
      return;
    }

    if (totalDiamonds > (user?.diamonds || 0)) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${totalDiamonds} diamonds but only have ${user?.diamonds || 0}.\n\nWould you like to top up?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Top Up',
            onPress: () => navigation.navigate('Topup'),
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Gift',
      `Send ${quantity}x ${selectedGift.emoji} ${selectedGift.name} (${totalDiamonds} 💎) to ${receiverName || receiverIdInput}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              setLoading(true);

              const idempotencyKey = `gift_${Date.now()}_${Math.random()}`;
              const result = await walletService.sendGift(
                receiverIdInput,
                totalDiamonds,
                selectedGift.id,
                message || undefined,
                undefined,
                idempotencyKey
              );

              Alert.alert(
                'Gift Sent! 🎁',
                `Successfully sent ${selectedGift.emoji} ${selectedGift.name} to ${receiverName || receiverIdInput}!\n\nYour new balance: ${result.giverBalance} 💎`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              console.error('Send gift error:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to send gift');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Gift</Text>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>💎 {user?.diamonds || 0}</Text>
        </View>
      </View>

      {/* Receiver Input */}
      {!receiverId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipient</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter user ID"
            value={receiverIdInput}
            onChangeText={setReceiverIdInput}
            autoCapitalize="none"
          />
        </View>
      )}

      {/* Gift Catalog */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Gift</Text>
        <View style={styles.giftGrid}>
          {GIFT_CATALOG.map((gift) => (
            <TouchableOpacity
              key={gift.id}
              style={[
                styles.giftCard,
                selectedGift.id === gift.id && styles.giftCardSelected,
              ]}
              onPress={() => setSelectedGift(gift)}
            >
              <Text style={styles.giftEmoji}>{gift.emoji}</Text>
              <Text style={styles.giftName}>{gift.name}</Text>
              <Text style={styles.giftPrice}>💎 {gift.diamonds}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quantity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Message */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Message (Optional)</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Add a message..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Gift:</Text>
          <Text style={styles.summaryValue}>
            {quantity}x {selectedGift.emoji} {selectedGift.name}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Cost:</Text>
          <Text style={styles.summaryValueBold}>💎 {totalDiamonds}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Your Balance After:</Text>
          <Text style={styles.summaryValue}>💎 {(user?.diamonds || 0) - totalDiamonds}</Text>
        </View>
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[styles.sendButton, loading && styles.sendButtonDisabled]}
        onPress={handleSendGift}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendButtonText}>Send Gift 🎁</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#3b82f6',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  giftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  giftCard: {
    width: '25%',
    aspectRatio: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    margin: 4,
    backgroundColor: '#fff',
  },
  giftCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  giftEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  giftName: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  giftPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 32,
  },
  summary: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
