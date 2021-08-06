const app = require('../../app');
const request = require('supertest');
const { getBackendTestToken } = require('../../requests/Auth0API.service');

describe('GET /api/sync', () => {
	test('Sync with no token returns 401', async () => {
		const response = await request(app).get('/api/sync');
		expect(response.statusCode).toBe(401);
	});

	test('Sync with login returns 200', async () => {
		const token = await getBackendTestToken();
		const response = await request(app)
			.get('/api/sync')
            .set('Authorization', 'Bearer ' + token.access_token);
		expect(response.statusCode).toBe(200);
	});
    
});
