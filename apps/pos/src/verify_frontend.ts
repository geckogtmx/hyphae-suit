
const verifyFrontend = async () => {
    console.log('🔍 Verifying Frontend Availability...');
    try {
        const res = await fetch('http://localhost:3002');
        if (res.ok) {
            console.log('✅ Frontend is serving (HTTP 200)');
            const html = await res.text();
            console.log('Title:', html.match(/<title>(.*?)<\/title>/)?.[1]);
            // Check if root element exists
            if (html.includes('id="root"')) {
                console.log('✅ React Root present');
            }
        } else {
            console.error('❌ Frontend returned:', res.status);
        }
    } catch (e) {
        console.error('❌ Failed to connect to frontend:', e.message);
    }
};

verifyFrontend();
