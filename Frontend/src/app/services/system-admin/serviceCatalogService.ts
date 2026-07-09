import { apiClient } from "../apiClient";

export interface ServiceItem {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  unit: string;
  unitPrice: number;
  description: string | null;
  isActive: boolean;
}

export interface CreateServiceRequest {
  serviceName: string;
  serviceType: string;
  unit: string;
  unitPrice: number;
  description?: string;
}

export interface UpdateServiceRequest {
  serviceName: string;
  serviceType: string;
  unit: string;
  unitPrice: number;
  description?: string;
  isActive: boolean;
}

export const serviceCatalogService = {
  getAll: () => apiClient.get<ServiceItem[]>("/services"),
  create: (request: CreateServiceRequest) => apiClient.post<ServiceItem>("/services", request),
  update: (serviceId: string, request: UpdateServiceRequest) =>
    apiClient.put<ServiceItem>(`/services/${serviceId}`, request),
  remove: (serviceId: string) => apiClient.delete<void>(`/services/${serviceId}`),
};
