import { apiClient } from './apiClient';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  uptime_seconds: number;
}

export const healthService = {
  async getHealth(): Promise<HealthResponse> {
    return apiClient<HealthResponse>('/health');
  },
};
