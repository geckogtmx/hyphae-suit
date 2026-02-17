
const { io } = require('socket.io-client');
const fetch = globalThis.fetch;

async function testSync() {
    console.log('--- SYNC TEST START ---');

    // 1. Setup Socket Listener (Simulating BOH)
    const socket = io('http://localhost:3001', { transports: ['websocket'] });

    socket.on('connect', () => {
        console.log('✅ BOH (Test) connected to Socket');
    });

    socket.on('order:new', (ticket) => {
        console.log('🔔 RECEIVED NEW ORDER TICKET:', JSON.stringify(ticket, null, 2));
        socket.disconnect();
        process.exit(0);
    });

    // 2. Perform Login (Simulating POS)
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '1234' })
    });
    const { token } = await loginRes.json();
    console.log('✅ Login successful, token received.');

    // 3. Create Kitchen Note (Simulating POS Order Fire)
    console.log('Firing order ticket...');
    const orderPayload = {
        productName: "Double Cheeseburger Meal",
        orderDetails: {
            id: "ORDER-TEST-777",
            items: [{ name: "DBL CHZ BGR", qty: 1 }]
        }
    };

    const fireRes = await fetch('http://localhost:3001/api/kitchen-note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
    });

    if (fireRes.ok) {
        const result = await fireRes.json();
        console.log('✅ Order fired successfully. Shorthand:', result.result);
    } else {
        console.error('❌ Failed to fire order:', await fireRes.text());
        socket.disconnect();
        process.exit(1);
    }

    // Wait for socket message
    setTimeout(() => {
        console.error('❌ Timeout: No socket message received.');
        socket.disconnect();
        process.exit(1);
    }, 5000);
}

testSync();
