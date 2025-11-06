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

const TOPUP_PACKAGES = [
  { diamonds: 100, price: 10, popular: false },
  { diamonds: 500, price: 50, popular: false },
  { diamonds: 1000, price: 100, popular: true },
  { diamonds: 2500, price: 250, popular: false },
  { diamonds: 5000, price: 500, popular: false },
  { diamonds: 10000, price: 1000, popular: false },
];

export default function TopupScreen({ navigation }: any) {
  const [selectedPackage, setSelectedPackage] = useState(TOPUP_PACKAGES[2]); // 1000 diamonds
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopup = async () => {
    try {
      setLoading(true);

      const diamonds = customAmount
        ? walletService.inrToDiamonds(parseInt(customAmount))
        : selectedPackage.diamonds;

      if (diamonds < 10) {
        Alert.alert('Error', 'Minimum topup is 10 diamonds (₹1)');
        return;
      }

      if (diamonds > 100000) {
        Alert.alert('Error', 'Maximum topup is 100,000 diamonds per transaction');
        return;
      }

      // Create payment order
      const idempotencyKey = `topup_${Date.now()}_${Math.random()}`;
      const order = await walletService.createTopupOrder(diamonds, idempotencyKey);

      console.log('Payment order created:', order);

      // In development mode, auto-verify the mock payment
      if (__DEV__ && order.providerOrder?.mockPaymentId) {
        Alert.alert(
          'Dev Mode',
          `Mock payment created. Auto-verifying...`,
          [
            {
              text: 'Verify',
              onPress: async () => {
                try {
                  const result = await walletService.verifyPayment(
                    order.id,
                    order.providerOrder.mockPaymentId,
                    order.providerOrder.mockSignature || 'mock_signature'
                  );

                  Alert.alert(
                    'Success!',
                    `${diamonds} diamonds credited to your account!\nNew balance: ${result.newBalance} 💎`,
                    [
                      {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                      },
                    ]
                  );
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Payment verification failed');
                }
              },
            },
          ]
        );
      } else {
        // In production, open payment gateway (Razorpay/Stripe)
        Alert.alert(
          'Payment Required',
          'This would open the payment gateway in production mode.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Topup error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create topup order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Up Diamonds</Text>
        <Text style={styles.subtitle}>Choose a package or enter custom amount</Text>
      </View>

      {/* Predefined Packages */}
      <View style={styles.packagesContainer}>
        {TOPUP_PACKAGES.map((pkg, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.packageCard,
              selectedPackage === pkg && styles.packageCardSelected,
              pkg.popular && styles.packageCardPopular,
            ]}
            onPress={() => {
              setSelectedPackage(pkg);
              setCustomAmount('');
            }}
          >
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}
            <Text style={styles.packageDiamonds}>💎 {pkg.diamonds}</Text>
            <Text style={styles.packagePrice}>₹{pkg.price}</Text>
            <Text style={styles.packageBonus}>
              {pkg.diamonds >= 5000 ? '+10% Bonus!' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Amount */}
      <View style={styles.customSection}>
        <Text style={styles.sectionTitle}>Or Enter Custom Amount</Text>
        <View style={styles.customInputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.customInput}
            placeholder="Enter amount"
            keyboardType="number-pad"
            value={customAmount}
            onChangeText={(text) => {
              setCustomAmount(text);
              setSelectedPackage(TOPUP_PACKAGES[0]); // Clear selection
            }}
          />
        </View>
        {customAmount && (
          <Text style={styles.conversionText}>
            = {walletService.inrToDiamonds(parseInt(customAmount) || 0)} 💎 diamonds
          </Text>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>You'll receive:</Text>
          <Text style={styles.summaryValue}>
            💎{' '}
            {customAmount
              ? walletService.inrToDiamonds(parseInt(customAmount) || 0)
              : selectedPackage.diamonds}{' '}
            diamonds
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total to pay:</Text>
          <Text style={styles.summaryValue}>
            ₹{customAmount || selectedPackage.price}
          </Text>
        </View>
      </View>

      {/* Pay Button */}
      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handleTopup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>
            Proceed to Pay ₹{customAmount || selectedPackage.price}
          </Text>
        )}
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Payment Info</Text>
        <Text style={styles.infoText}>• Instant diamond credit after payment</Text>
        <Text style={styles.infoText}>• Secure payment via Razorpay</Text>
        <Text style={styles.infoText}>• 100% refund within 7 days</Text>
        {__DEV__ && (
          <Text style={[styles.infoText, { color: '#f59e0b' }]}>
            • DEV MODE: Payments are mocked
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  packagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  packageCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  packageCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  packageCardPopular: {
    borderColor: '#10b981',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  packageDiamonds: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
  },
  packageBonus: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    height: 16,
  },
  customSection: {
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
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    color: '#1f2937',
  },
  conversionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  payButton: {
    backgroundColor: '#3b82f6',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#3b82f6',
    marginBottom: 4,
  },
});
