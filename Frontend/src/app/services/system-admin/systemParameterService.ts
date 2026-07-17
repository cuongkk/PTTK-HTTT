import { apiClient } from "../apiClient";

export interface SystemParameter {
  parameterId: string;
  parameterName: string;
  parameterGroup: string;
  value: string;
  dataType: string;
  description: string | null;
  isActive: boolean;
  updatedAt: string | null;
}

export const systemParameterService = {
  getAll: () => apiClient.get<SystemParameter[]>("/system-parameters"),
  update: (parameterId: string, value: string, isActive: boolean) =>
    apiClient.put<SystemParameter>(`/system-parameters/${parameterId}`, { value, isActive }),
};
