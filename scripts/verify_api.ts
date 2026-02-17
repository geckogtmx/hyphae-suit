
const API_URL = 'http://localhost:3001';
const API_KEY = process.env.HYPHAE_API_KEY || 'dev-secret-123'; // Default dev key

async function verifyAnalyze() {
    console.log(`🔍 Verifying /api/analyze endpoint...`);

    const payload = {
        menu: [
            { id: 'p_1', name: 'Taco Al Pastor', price: 4.50, categoryId: 'tacos' },
            { id: 'p_2', name: 'Horchata', price: 3.00, categoryId: 'drinks' }
        ]
    };

    try {
        const res = await fetch(`${API_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('✅ /api/analyze SUCCESS:', data);

        if (data.result && data.result.includes('MOCK')) {
            console.warn('⚠️  Warning: Received MOCK response. Is GEMINI_API_KEY set?');
        } else {
            console.log('🌟 Confirmed Real AI Response');
        }

    } catch (err) {
        console.error('❌ /api/analyze FAILED:', err);
        process.exit(1);
    }
}

async function verifyKitchenNote() {
    console.log(`\n🔍 Verifying /api/kitchen-note endpoint...`);

    const payload = {
        productName: "Spicy Tuna Roll with Extra Wasabi and No Cucumber"
    };

    try {
        const res = await fetch(`${API_URL}/api/kitchen-note`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('✅ /api/kitchen-note SUCCESS:', data);
        console.log('   Shorthand:', data.note);

    } catch (err) {
        console.error('❌ /api/kitchen-note FAILED:', err);
        process.exit(1);
    }
}

async function main() {
    await verifyAnalyze();
    await verifyKitchenNote();
    console.log('\n🎉 All API Verifications Passed!');
}

main();
