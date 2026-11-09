import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dental-a.onrender.com';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header if token exists in localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dentagent_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle auth expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/verify-otp') && path !== '/') {
        localStorage.removeItem('dentagent_token');
        localStorage.removeItem('dentagent_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; practiceName: string; phoneNumber?: string }) =>
    apiClient.post('/auth/register', data),
  verifyOtp: (email: string, otp: string) => apiClient.post('/auth/verify-otp', { email, otp }),
  resendOtp: (email: string) => apiClient.post('/auth/resend-otp', { email }),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout')
};

// Patient Endpoints
export const patientApi = {
  getPatients: (params?: { status?: string; minOverdue?: number; search?: string }) =>
    apiClient.get('/patients', { params }),
  getPatientById: (id: string) => apiClient.get(`/patients/${id}`),
  createPatient: (data: any) => apiClient.post('/patients', data),
  bulkImport: (patients: any[]) => apiClient.post('/patients/bulk-import', { patients }),
  triggerReactivation: (data: { patientIds?: string[]; customTemplate?: string }) =>
    apiClient.post('/patients/trigger-reactivation', data),
  updatePatient: (id: string, data: any) => apiClient.put(`/patients/${id}`, data)
};

// Appointment Endpoints
export const appointmentApi = {
  getAppointments: (params?: { status?: string; startDate?: string; endDate?: string }) =>
    apiClient.get('/appointments', { params }),
  createAppointment: (data: any) => apiClient.post('/appointments', data),
  updateStatus: (id: string, status: string) => apiClient.put(`/appointments/${id}/status`, { status }),
  getMetrics: () => apiClient.get('/appointments/metrics')
};

// Conversation & SMS Endpoints
export const conversationApi = {
  getConversations: () => apiClient.get('/conversations'),
  getMessages: (conversationId: string) => apiClient.get(`/conversations/${conversationId}/messages`),
  sendManualReply: (conversationId: string, body: string) =>
    apiClient.post('/conversations/manual-reply', { conversationId, body }),
  toggleAutoPilot: (conversationId: string) => apiClient.put(`/conversations/${conversationId}/toggle-autopilot`),
  simulateSMS: (patientId: string, messageText: string) =>
    apiClient.post('/conversations/simulate-sms', { patientId, messageText })
};

// Billing Endpoints ($600 Flat + $20/chair)
export const billingApi = {
  getOverview: () => apiClient.get('/billing/overview'),
  getInvoices: () => apiClient.get('/billing/invoices'),
  generateInvoice: (month?: number, year?: number) => apiClient.post('/billing/generate-invoice', { month, year }),
  payInvoice: (invoiceId: string) => apiClient.put(`/billing/invoices/${invoiceId}/pay`)
};

// Tenant & Settings
export const tenantApi = {
  getProfile: () => apiClient.get('/tenants/profile'),
  updateProfile: (data: any) => apiClient.put('/tenants/profile', data),
  getAllTenants: () => apiClient.get('/tenants/all')
};

// Analytics
export const analyticsApi = {
  getDashboard: () => apiClient.get('/analytics/dashboard')
};
