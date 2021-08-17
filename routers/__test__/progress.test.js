const app = require('../../app');
const request = require('supertest');
const supabase = require('../../auth/supabase');
const {
	getBackendTestToken,
	getBackendTestOpToken,
} = require('../../requests/Auth0API.service');
const jwtDecode = require('jwt-decode');

let token;
let opToken;

beforeAll(async () => {
	const accessToken = await getBackendTestToken();
	const opAccessToken = await getBackendTestOpToken();
	token = accessToken.access_token;
	opToken = opAccessToken.access_token;
});

const addEndpoint = '/progress/add';
describe(`POST ${addEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(addEndpoint).expect(401);
	});

	test('Authorized acess, with invalid point, should return 400', () => {
		request(app)
			.post(addEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({
				points: ['Not a real point'],
			})
			.expect(400);
	});

	test('Authorized acess, with valid input, should return 200', () => {
		request(app)
			.post(addEndpoint)
			.set('Authorization', 'Bearer ' + token)
            .set('Content-Type', 'application/json')
			.send({
				points: ['03fa4555-509c-4636-9728-bb2de689e4d3'],
			})
			.expect(200);
	});
});

const getEndpoint = '/progress/get';
describe(`GET ${getEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(getEndpoint).expect(401);
	});

	test('Authorized access, should return 200', () => {
		request(app)
			.get(getEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
	});
});

const getUserProgressEndpoint = '/progress/getuserprogress';
describe(`GET ${getUserProgressEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(getUserProgressEndpoint).expect(401);
	});

	test('Unauthorized access, should return 401', () => {
		request(app)
			.get(getUserProgressEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.expect(401);
	});

	test('Authorized access, should return 200', () => {
		const jwt = jwtDecode(token);
		request(app)
			.get(getUserProgressEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.query({ studentid: jwt.sub })
            .expect(200);
	});
});

const getProgressInSubjectEndpoint = '/progress/getprogressinsubject';
describe(`GET ${getProgressInSubjectEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(getProgressInSubjectEndpoint).expect(401);
	});

	test('Authorized access, should return 200', () => {
		request(app)
			.get(getProgressInSubjectEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.query({ subjectid: '9912ccbb-c55b-4124-b322-285e45d578f0' })
			.expect(200);
	});
});

afterAll(async () => {
	const jwt = jwtDecode(token);
	await supabase.from('student_points').delete().match({student_id: jwt.sub});
});