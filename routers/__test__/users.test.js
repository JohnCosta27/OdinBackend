const app = require('../../app');
const request = require('supertest');
const supabase = require('../../auth/supabase');
const { getBackendTestToken } = require('../../requests/Auth0API.service');
const jwtDecode = require('jwt-decode');

let token;

beforeAll(async () => {
	const accessToken = await getBackendTestToken();
	token = accessToken.access_token;
});

describe('POST /users/addsubject', () => {
	const endpoint = '/users/addsubject';
	test('Unauthorized access, should return 401', async () => {
		const response = await request(app).post(endpoint);
		expect(response.statusCode).toBe(401);
	});

	test('Authorized access with no body', async () => {
		const response = await request(app)
			.post(endpoint)
			.set('Authorization', 'Bearer ' + token);
		expect(response.statusCode).toBe(400);
	});

	test('Authorized acess with erronous data should return 400', async () => {
		await request(app)
			.post(endpoint)
			.set('Authorization', 'Bearer ' + token)
			.set('Accept', 'application/json')
			.send({ subjectid: -1 })
			.expect(400);
	});

	test('Authorized access with correct data', async () => {
		await request(app)
			.post(endpoint)
			.set('Authorization', 'Bearer ' + token)
			.set('Accept', 'application/json')
			.send({ subjectid: '9912ccbb-c55b-4124-b322-285e45d578f0' })
			.expect(200);
	});
});

afterAll(async () => {
	const jwt = jwtDecode(token);
	await supabase.from('student_subjects').delete().match({ studentid: jwt.sub });
});
