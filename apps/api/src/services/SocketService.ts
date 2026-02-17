import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

class SocketService {
    private io: Server | null = null;
    private static instance: SocketService;

    private constructor() {
        // Private constructor for singleton
    }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public initialize(server: HttpServer) {
        if (this.io) return;

        this.io = new Server(server, {
            cors: {
                origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
                methods: ['GET', 'POST']
            }
        });

        console.log('✅ Socket.IO Initialized');

        this.io.on('connection', (socket: Socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);

            // Room logic
            socket.on('join:store', (storeId: string) => {
                const room = `store:${storeId}`;
                socket.join(room);
                console.log(`Socket ${socket.id} joined ${room}`);
            });

            // Order created (from POS) -> Notify BOH
            socket.on('order:created', (payload: any) => {
                console.log(`📦 Order received from POS:`, payload.id);
                // Broadcast to BOH (Kitchen Display)
                // For simplicity, broadcast to everyone for now. 
                // In production, we'd emit to `store:${payload.storeId}`
                this.io?.emit('order:new', payload);
            });

            // Order status update (from BOH) -> Notify POS
            socket.on('order:update-status', (payload: { orderId: string, status: string }) => {
                console.log(`🔄 Status update: ${payload.orderId} -> ${payload.status}`);
                this.io?.emit('order:status-changed', payload);
            });

            socket.on('disconnect', () => {
                // console.log(`❌ Client disconnected: ${socket.id}`);
            });
        });
    }

    public emit(event: string, data: any) {
        if (this.io) {
            this.io.emit(event, data);
        } else {
            console.warn('⚠️ SocketService not initialized, cannot emit:', event);
        }
    }
}

export const socketService = SocketService.getInstance();
