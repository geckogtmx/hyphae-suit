
const { io } = require('socket.io-client');
const fetch = globalThis.fetch;

async function testStatusBounce() {
    console.log('--- STATUS BOUNCE TEST START ---');

    // 1. Setup Socket Listener (Simulating POS)
    const posSocket = io('http://localhost:3001', { transports: ['websocket'] });

    posSocket.on('connect', () => {
        console.log('✅ POS (Test) connected to Socket');
    });

    let statusReceived = false;
    posSocket.on('order:status-changed', (data) => {
        console.log('🔄 POS RECEIVED STATUS UPDATE:', JSON.stringify(data, null, 2));
        statusReceived = true;
        posSocket.disconnect();
        process.exit(0);
    });

    // 2. Add a ticket to the queue (Simulating POS Order) via API
    console.log('Firing dummy order...');
    const fireRes = await fetch('http://localhost:3001/api/kitchen-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'dev-secret-123' },
        body: JSON.stringify({ productName: "Bounce Test", orderDetails: { id: "BOUNCE-1" } })
    });
    const { ticketId } = await fireRes.json();
    console.log(`✅ Ticket created: ${ticketId}`);

    // 3. Complete the ticket (Simulating BOH Bump) via API
    console.log('Waiting 1s before completion...');
    await new Promise(r => setTimeout(r, 1000));

    console.log('Completing ticket (BOH Bump)...');
    const completeRes = await fetch(`http://localhost:3001/api/kitchen-queue/${ticketId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'dev-secret-123' },
        body: JSON.stringify({})
    });

    if (completeRes.ok) {
        console.log('✅ Ticket completed successfully.');
    } else {
        console.error('❌ Failed to complete ticket.');
        posSocket.disconnect();
        process.exit(1);
    }

    // Wait for socket message
    setTimeout(() => {
        if (!statusReceived) {
            console.error('❌ Timeout: No status update received by POS.');
            posSocket.disconnect();
            process.exit(1);
        }
    }, 5000);
}

testStatusBounce();
