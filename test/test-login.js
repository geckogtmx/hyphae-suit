
// Native fetch
const fetch = globalThis.fetch;

async function testLogin(pin) {
    console.log(`Testing Login with PIN: ${pin}`);
    try {
        const res = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });

        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}


(async () => {
    await testLogin('1234'); // Valid Staff
    await testLogin('0000'); // Valid Admin
    await testLogin('1111'); // Invalid
})();
