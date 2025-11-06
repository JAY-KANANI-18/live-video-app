import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { agencyService, Agency } from '../../services/agencyService';
import { useAuthStore } from '../../store/authStore';

export default function AgencyScreen({ navigation }: any) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { user, refreshProfile } = useAuthStore();

  useEffect(() => {
    loadAgencyInfo();
  }, []);

  const loadAgencyInfo = async () => {
    if (!user?.agencyId) {
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const info = await agencyService.getAgencyInfo();
      setAgency(info);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load agency information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Agency',
      'Are you sure you want to leave this agency? You can join another agency later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setLeaving(true);
              await agencyService.leaveAgency();
              await refreshProfile();
              Alert.alert('Success', 'You have left the agency', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to leave agency');
            } finally {
              setLeaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!agency) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load agency information</Text>
        <TouchableOpacity style={styles.button} onPress={loadAgencyInfo}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.agencyIcon}>
          <Text style={styles.agencyIconText}>{agency.name[0]}</Text>
        </View>
        <Text style={styles.agencyName}>{agency.name}</Text>
        <View style={styles.codeBadge}>
          <Text style={styles.codeLabel}>Agency Code</Text>
          <Text style={styles.codeText}>{agency.code}</Text>
        </View>
        {!agency.isActive && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>Inactive</Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{agency.totalHosts}</Text>
          <Text style={styles.statLabel}>Total Hosts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{agency.commissionRate}%</Text>
          <Text style={styles.statLabel}>Commission</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{agency.totalEarnings}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{agency.email}</Text>
        </View>
        {agency.phoneNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{agency.phoneNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Benefits</Text>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>✨ Host Status</Text>
          <Text style={styles.benefitText}>
            You are a verified host and can receive video calls
          </Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>💎 Earnings</Text>
          <Text style={styles.benefitText}>
            Earn diamonds from calls. Agency takes {agency.commissionRate}% commission
          </Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>🎯 Support</Text>
          <Text style={styles.benefitText}>
            Get support and guidance from your agency
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.leaveButton}
        onPress={handleLeave}
        disabled={leaving}
      >
        {leaving ? (
          <ActivityIndicator color="#ef4444" />
        ) : (
          <Text style={styles.leaveButtonText}>Leave Agency</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Joined on {new Date().toLocaleDateString()}
        </Text>
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
  header: {
    backgroundColor: '#fff',
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  agencyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  agencyIconText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  agencyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  inactiveBadge: {
    marginTop: 8,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveBadgeText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 24,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  benefitCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  leaveButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
});
