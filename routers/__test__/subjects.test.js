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

const createEndpoint = '/subjects/create';
describe(`POST ${createEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', async () => {
		const response = await request(app).post(createEndpoint);
		expect(response.statusCode).toBe(401);
	});

	test('Unauthorized access (no permission), should return 403', async () => {
		const response = await request(app)
			.post(createEndpoint)
			.set('Authorization', 'Bearer ' + token);
		expect(response.statusCode).toBe(403);
	});

	test('Authorized token (permission), with invalid body, should return 400', async () => {
		const response = await request(app)
			.post(createEndpoint)
			.set('Authorization', 'Bearer ' + opToken);
		expect(response.statusCode).toBe(400);
	});

	test('Authorized token, with conflicting name && level && examboard, should return 400', async () => {
		const response = await request(app)
			.post(createEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ name: 'Maths', examboard: 'Pearson', level: 'A-level' });
		expect(response.statusCode).toBe(400);
	});

	test('Authorized access with correct data', async () => {
		const response = await request(app)
			.post('/subjects/create')
			.set('Authorization', 'Bearer ' + opToken)
			.set('Accept', 'application/json')
			.send({ name: 'Test', examboard: 'Pearson', level: 'A-level' });
		expect(response.statusCode).toBe(200);
	});
});

const createPointsEndpoint = '/subjects/createpoints';
describe(`POST ${createPointsEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', async () => {
		const response = await request(app).post(createPointsEndpoint);
		expect(response.statusCode).toBe(401);
	});

	test('Unauthorized access (no permission), should return 403', async () => {
		const response = await request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + token);
		expect(response.statusCode).toBe(403);
	});

	test('Authorized token (permission), with invalid body, should return 400', async () => {
		const response = await request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken);
		expect(response.statusCode).toBe(400);
	});

	test('Authorized token, with invalid subject, should return 400', async () => {
		const response = await request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ subjectid: -1 });
		expect(response.statusCode).toBe(400);
	});

	test('Authorized token, new topic, with missing newTopic in body should return 400', async () => {
		const response = await request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.send({
				subject: '9912ccbb-c55b-4124-b322-285e45d578f0',
				topic: 1,
				points: 'This is a test',
			})
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');
		expect(response.statusCode).toBe(400);
	});

	test('Authorized token, existing topic and new point, should return 200', async () => {
		const response = await request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.send({
				subject: '9912ccbb-c55b-4124-b322-285e45d578f0',
				topic: '308d4d9c-3173-405b-9350-1ae6a66bedeb',
				points: 'This is a test',
			})
			.set('Accept', 'application/json');
		expect(response.statusCode).toBe(200);
	});

	test('Authorized token, existing topic and multiple new point, should return 200', async () => {
		const response = await request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.send({
				subject: '9912ccbb-c55b-4124-b322-285e45d578f0',
				topic: '308d4d9c-3173-405b-9350-1ae6a66bedeb',
				points: 'This is a test #2\nThis is a test #3',
			})
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');
		expect(response.statusCode).toBe(200);
	});

	test('Authorized token, new topic and new point, should return 200', async () => {
		const response = await request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.send({
				subject: '9912ccbb-c55b-4124-b322-285e45d578f0',
				topic: 1,
				newTopic: 'Test topic',
				points: 'This is a test #4',
			})
			.set('Accept', 'application/json')
			.set('Content-Type', 'application/json');
		expect(response.statusCode).toBe(200);
	});
});

const getAllEndpoint = '/subjects/getall';
describe(`GET ${getAllEndpoint}`, () => {
	test('Unauthorized access (no token), should return 400', async () => {
		await request(app).get(getAllEndpoint).expect(400);
	});

	test('Authorized acess', async () => {
		await request(app)
			.get(getAllEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
	});
});

const getNewEndpoint = '/subjects/getnew';
describe(`GET ${getNewEndpoint}`, () => {
	test('Unauthorized access (no token), should return 400', async () => {
		await request(app).get(getNewEndpoint).expect(400);
	});

	test('Authorized access', async () => {
		const addSubject = await supabase
			.from('student_subjects')
			.insert([{ subjectid: '9912ccbb-c55b-4124-b322-285e45d578f0' }]);
		expect(addSubject.error).toBe(null);

		const newSubjects = await request(app).get(getNewEndpoint);

		console.log(newSubjects);
		for (let subject of newSubjects) {
			expect(subject.id).toBe(!'9912ccbb-c55b-4124-b322-285e45d578f0');
		}
	});
});

afterAll(async () => {
	await supabase
		.from('subjects')
		.delete()
		.match({ name: 'Test', examboard: 'Pearson', level: 'A-level' });
	await supabase.from('points').delete().match({
		topicid: '308d4d9c-3173-405b-9350-1ae6a66bedeb',
		name: 'This is a test',
	});
	await supabase.from('points').delete().match({
		topicid: '308d4d9c-3173-405b-9350-1ae6a66bedeb',
		name: 'This is a test #2',
	});
	await supabase.from('points').delete().match({
		topicid: '308d4d9c-3173-405b-9350-1ae6a66bedeb',
		name: 'This is a test #3',
	});
	await supabase.from('points').delete().match({
		topicid: '308d4d9c-3173-405b-9350-1ae6a66bedeb',
		name: 'This is a test #4',
	});
	const { data } = await supabase.from('topics').select('*').match({
		name: 'Test topic',
		subjectid: '9912ccbb-c55b-4124-b322-285e45d578f0',
	});
	await supabase
		.from('points')
		.delete()
		.match({ topicid: data[0].topicid, name: 'This is a test' });
	await supabase.from('topics').delete().match({ id: data.id });
});
