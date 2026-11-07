import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PRACTICE_ADMIN' | 'STAFF_USER';
  isVerified: boolean;
  practice?: {
    _id: string;
    practiceName: string;
    phoneNumber: string;
    status: string;
    subscription: {
      flatFee: number;
      perBookingCommission: number;
    };
  };
}

interface AppState {
  user: User | null;
  token: string | null;
  unreadCount: number;
  selectedConversationId: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setUnreadCount: (count: number) => void;
  setSelectedConversationId: (id: string | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: typeof window !== 'undefined' && localStorage.getItem('dentagent_user')
    ? JSON.parse(localStorage.getItem('dentagent_user') || 'null')
    : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('dentagent_token') : null,
  unreadCount: 0,
  selectedConversationId: null,

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('dentagent_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('dentagent_user');
      }
    }
    set({ user });
  },

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('dentagent_token', token);
      } else {
        localStorage.removeItem('dentagent_token');
      }
    }
    set({ token });
  },

  setUnreadCount: (count) => set({ unreadCount: count }),
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dentagent_user');
      localStorage.removeItem('dentagent_token');
    }
    set({ user: null, token: null, selectedConversationId: null });
  }
}));
