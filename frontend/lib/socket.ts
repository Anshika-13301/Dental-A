import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected with socket ID:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected from real-time stream');
    });
  }

  return socket as Socket;
};

export const joinPracticeRoom = (practiceId: string) => {
  const s = getSocket();
  if (s && practiceId) {
    s.emit('join:practice', practiceId);
  }
};
