import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketManager {
    private socket: Socket | null = null;
    private static instance: SocketManager;

    private constructor() {
        // Private
    }

    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    public connect(storeId: string = 'default-store') {
        if (this.socket?.connected) return;

        console.log('🔌 Connecting to Socket Server at', SOCKET_URL);

        // Initialize socket but don't connect automatically
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: false,
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket Server');
            this.socket?.emit('join:store', storeId);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket Server');
        });

        this.socket.connect();
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public emit(event: string, data: any) {
        if (this.socket) { // Allow emitting if socket instance exists, even if reconnecting
            this.socket.emit(event, data);
        } else {
            console.warn('⚠️ Socket not initialized, cannot emit:', event);
        }
    }

    public on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
    }

    public off(event: string) {
        this.socket?.off(event);
    }
}

export const socketManager = SocketManager.getInstance();
