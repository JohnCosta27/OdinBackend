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

const endpoint = '/users/addsubject';
describe(`POST ${endpoint}`, () => {
	test('Unauthorized access, should return 401', () => {
		request(app).post(endpoint).expect(401);
	});

	test('Authorized access with no body', () => {
		request(app)
			.post(endpoint)
			.set('Authorization', 'Bearer ' + token)
			.expect(400);
	});

	test('Authorized acess with erronous data should return 400', () => {
		request(app)
			.post(endpoint)
			.set('Authorization', 'Bearer ' + token)
			.set('Accept', 'application/json')
			.send({ subjectid: -1 })
			.expect(400);
	});

	test('Authorized access with correct data', () => {
		request(app)
			.post(endpoint)
			.set('Authorization', 'Bearer ' + token)
			.set('Accept', 'application/json')
			.send({ subjectid: '9912ccbb-c55b-4124-b322-285e45d578f0' })
			.expect(200);
	});
});

afterAll(() => {
	const jwt = jwtDecode(token);
	supabase.from('student_subjects').delete().match({ studentid: jwt.sub });
});
