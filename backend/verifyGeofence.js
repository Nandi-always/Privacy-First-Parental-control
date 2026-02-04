const BASE_URL = 'http://localhost:5001/api';
let token = '';
let childId = '';

async function runTest() {
    try {
        console.log('--- Geofence Verification Test ---');

        // 1. Login to get token
        console.log('1. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'parent@example.com',
                password: 'Password123',
                role: 'parent'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);
        token = loginData.token;
        console.log('   ✅ Logged in successfully');

        // 2. Get childId
        console.log('2. Fetching children...');
        const childrenRes = await fetch(`${BASE_URL}/child`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const childrenData = await childrenRes.json();
        const children = childrenData.children || childrenData;
        if (children.length === 0) throw new Error('No children found. Run createTestAccounts.js first.');
        childId = children[0]._id || children[0].id;
        console.log(`   ✅ Found child: ${children[0].name} (${childId})`);

        // 3. Set Geofence
        console.log('3. Setting Geofence (Start location: New York, radius: 200m)...');
        const geofence = {
            start: {
                latitude: 40.7128,
                longitude: -74.0060,
                address: 'New York, NY',
                radius: 200
            },
            enabled: true
        };
        await fetch(`${BASE_URL}/location/geofence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ childId, geofence })
        });
        console.log('   ✅ Geofence set');

        // 4. Update location to be OUTSIDE geofence (Los Angeles)
        console.log('4. Updating location to OUTSIDE geofence (Los Angeles)...');
        await fetch(`${BASE_URL}/location/${childId}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                latitude: 34.0522,
                longitude: -118.2437,
                address: 'Los Angeles, CA',
                accuracy: 10
            })
        });
        console.log('   ✅ Location updated (outside)');

        // 5. Verify notification was created
        console.log('5. Verifying alert notification...');
        const notifRes = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const notifData = await notifRes.json();
        const alerts = notifData.filter(n => n.type === 'alert' && n.message.includes('outside'));
        if (alerts.length > 0) {
            console.log(`   ✅ SUCCESS: Alert found: "${alerts[0].message}"`);
        } else {
            console.log('   ❌ FAILURE: Alert notification not found');
        }

    } catch (err) {
        console.error('   ❌ ERROR:', err.message);
    }
}

runTest();
