const axios = require('axios');

async function testTrendsAPI() {
    try {
        console.log('🔐 Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@sandhyahome.org',
            password: 'Admin@123'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful\n');

        const residentId = '69734e62cab98f4fea22d3b0'; // Ramesh Kumar

        console.log('📊 Testing trends API for Ramesh Kumar...');
        const trendsRes = await axios.get(`http://localhost:3000/api/reports/trends/${residentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n✅ Trends API Response:');
        console.log('Months:', trendsRes.data.trends.months);
        console.log('Datasets:', Object.keys(trendsRes.data.trends.datasets));
        console.log('Reports count:', trendsRes.data.reports.length);
        console.log('\nFull response:', JSON.stringify(trendsRes.data, null, 2));

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        if (error.response?.data) {
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testTrendsAPI();
