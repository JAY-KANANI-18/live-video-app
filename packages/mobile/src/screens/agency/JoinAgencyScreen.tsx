import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { agencyService, Agency } from '../../services/agencyService';
import { useAuthStore } from '../../store/authStore';

export default function JoinAgencyScreen({ navigation }: any) {
  const [agencyCode, setAgencyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const { refreshProfile } = useAuthStore();

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setLoadingList(true);
      const list = await agencyService.listAgencies();
      setAgencies(list);
    } catch (error) {
      console.error('Failed to load agencies:', error);
    } finally {
      setLoadingList(false);
    }
  };

  const handleJoin = async (code: string) => {
    if (!code) {
      Alert.alert('Error', 'Please enter agency code');
      return;
    }

    try {
      setLoading(true);
      const response = await agencyService.joinAgency(code);
      
      // Refresh profile to get updated user data
      await refreshProfile();

      Alert.alert('Success', response.message, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to join agency');
    } finally {
      setLoading(false);
    }
  };

  const renderAgencyItem = ({ item }: { item: Agency }) => (
    <TouchableOpacity
      style={styles.agencyCard}
      onPress={() => setAgencyCode(item.code)}
    >
      <View style={styles.agencyHeader}>
        <Text style={styles.agencyName}>{item.name}</Text>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{item.code}</Text>
        </View>
      </View>
      <View style={styles.agencyStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalHosts}</Text>
          <Text style={styles.statLabel}>Hosts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.commissionRate}%</Text>
          <Text style={styles.statLabel}>Commission</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join an Agency</Text>
        <Text style={styles.subtitle}>
          Enter agency code or select from the list below
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Agency Code</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter agency code"
            value={agencyCode}
            onChangeText={(text) => setAgencyCode(text.toUpperCase())}
            autoCapitalize="characters"
          />
        </View>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoin(agencyCode)}
          disabled={loading || !agencyCode}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.joinButtonText}>Join Agency</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Available Agencies</Text>
        {loadingList ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={agencies}
            keyExtractor={(item) => item.id}
            renderItem={renderAgencyItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No agencies available</Text>
            }
            refreshing={loadingList}
            onRefresh={loadAgencies}
          />
        )}
      </View>
    </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  joinButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    flex: 1,
    marginTop: 12,
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  agencyCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  agencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  agencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  codeBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  agencyStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 20,
  },
});
