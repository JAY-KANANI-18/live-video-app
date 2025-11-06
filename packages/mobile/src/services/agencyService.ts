import apiClient from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Agency {
  id: string;
  name: string;
  code: string;
  email: string;
  phoneNumber?: string;
  commissionRate: number;
  totalHosts: number;
  totalEarnings: number;
  isActive: boolean;
}

export interface JoinAgencyResponse {
  message: string;
  user: {
    id: string;
    username: string;
    displayName?: string;
    isHost: boolean;
    agencyId: string;
    agency: Agency;
  };
  accessToken: string;
}

class AgencyService {
  /**
   * Join an agency with code
   */
  async joinAgency(agencyCode: string): Promise<JoinAgencyResponse> {
    const response = await apiClient.post('/agency/join', { agencyCode });
    
    // Update access token
    const { accessToken, user } = response.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['user', JSON.stringify(user)],
    ]);

    return response.data;
  }

  /**
   * Leave current agency
   */
  async leaveAgency(): Promise<void> {
    const response = await apiClient.post('/agency/leave');
    
    // Update access token
    const { accessToken, user } = response.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['user', JSON.stringify(user)],
    ]);

    return response.data;
  }

  /**
   * Get current agency info
   */
  async getAgencyInfo(): Promise<Agency> {
    const response = await apiClient.get('/agency/info');
    return response.data.agency;
  }

  /**
   * List all active agencies
   */
  async listAgencies(): Promise<Agency[]> {
    const response = await apiClient.get('/agency/list');
    return response.data.agencies;
  }
}

export const agencyService = new AgencyService();
