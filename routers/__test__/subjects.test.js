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
let subjectid;
let topicid;
let pointid;

beforeAll(async () => {
	const accessToken = await getBackendTestToken();
	const opAccessToken = await getBackendTestOpToken();
	token = accessToken.access_token;
	opToken = opAccessToken.access_token;

	const newSubject = await supabase
		.from('subjects')
		.insert([{ name: 'TestSubject', level: 'GCSE', examboard: 'AQA' }]);
	subjectid = newSubject.data[0].id;

	const newTopic = await supabase
		.from('topics')
		.insert([{ name: 'Test Topic', subjectid: subjectid }]);
	topicid = newTopic.data[0].id;

	const newPoint = await supabase
		.from('points')
		.insert([{ name: 'Test Point', topicid: topicid }]);
	pointid = newPoint.data[0].id;
});

const createEndpoint = '/subjects/create';
describe(`POST ${createEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).post(createEndpoint).expect(401);
	});

	test('Unauthorized access (no permission), should return 403', () => {
		request(app)
			.post(createEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.expect(403);
	});

	test('Authorized token (permission), with invalid body, should return 400', () => {
		request(app)
			.post(createEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.expect(400);
	});

	test('Authorized token, with conflicting name && level && examboard, should return 400', () => {
		request(app)
			.post(createEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ name: 'Maths', examboard: 'Pearson', level: 'A-level' })
			.expect(400);
	});

	test('Authorized access with correct data', () => {
		request(app)
			.post('/subjects/create')
			.set('Authorization', 'Bearer ' + opToken)
			.set('Accept', 'application/json')
			.send({ name: 'Test', examboard: 'Pearson', level: 'A-level' })
			.expect(200);
	});
});

const createPointsEndpoint = '/subjects/createpoints';
describe(`POST ${createPointsEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', async () => {
		const response = await request(app).post(createPointsEndpoint);
		expect(response.statusCode).toBe(401);
	});

	test('Unauthorized access (no permission), should return 403', () => {
		request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.expect(403);
	});

	test('Authorized token (permission), with invalid body, should return 400', () => {
		request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.expect(400);
	});

	test('Authorized token, with invalid subject, should return 400', () => {
		request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ subjectid: -1 })
			.expect(400);
	});

	test('Authorized token, new topic, with missing newTopic in body should return 400', () => {
		request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.send({
				subject: subjectid,
				topic: 1,
				points: 'This is a test',
			})
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(400);
	});

	test('Authorized token, new topic and new point, should return 200', () => {
		request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.set('Accept', 'application/json')
			.set('Content-Type', 'application/json')
			.send({
				subject: subjectid,
				topic: 1,
				newTopic: 'Test topic',
				points: 'This is a test #4',
			})
			.expect(200);
	});

	test('Authorized token, existing topic and multiple new point, should return 200', () => {
		request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.send({
				subject: subjectid,
				topic: topicid,
				points: 'This is a test #2\nThis is a test #3',
			})
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(200);
	});

	test('Authorized token, existing topic and new point, should return 200', () => {
		request(app)
			.post(createPointsEndpoint)
			.set('Authorization', 'Bearer ' + opToken)
			.send({
				subject: subjectid,
				topic: topicid,
				points: 'This is a test',
			})
			.set('Accept', 'application/json')
			.expect(200);
	});
});

const getAllEndpoint = '/subjects/getall';
describe(`GET ${getAllEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', async () => {
		await request(app).get(getAllEndpoint).expect(401);
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
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(getNewEndpoint).expect(401);
	});

	test('Authorized access', () => {
		request(app)
			.get(getNewEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
	});
});

const getSubjectEndpoint = '/subjects/get';
describe(`GET ${getSubjectEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', async () => {
		await request(app).get(getSubjectEndpoint).expect(401);
	});

	test('Authorized access', async () => {
		const response = await request(app)
			.get(getSubjectEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.query({ subjectid: subjectid })
			.expect(200);

		expect(response.body.topics).not.toBe(null);
		expect(response.body.points).not.toBe(null);
	});
});

const getUserSubjectsEndpoint = '/subjects/getusersubjects';
describe(`GET ${getUserSubjectsEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(getUserSubjectsEndpoint).expect(401);
	});

	test('Authorized access', () => {
		request(app)
			.get(getUserSubjectsEndpoint)
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
	});
});

const getAllTopicsEndpoint = '/subjects/getalltopics';
describe(`GET ${getAllTopicsEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(getAllTopicsEndpoint).expect(401);
	});

	test('Authorized access', () => {
		request(app)
			.get(getAllTopicsEndpoint)
			.query({ subjectid: subjectid })
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
	});
});

const getPointsEndpoint = '/subjects/getpoints';
describe(`GET ${getPointsEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(getPointsEndpoint).expect(401);
	});

	test('Authorized access', async () => {
		const response = await request(app)
			.get(getPointsEndpoint)
			.query({ topicid: topicid })
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
		expect(response.body.length).not.toBe(0);
	});
});

const getPointEndpoint = '/subjects/getpoint';
describe(`GET ${getPointEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(getPointEndpoint).expect(401);
	});

	test('Authorized access', async () => {
		const response = await request(app)
			.get(getPointEndpoint)
			.query({ pointid: pointid })
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
		expect(response.body.length).not.toBe(0);
	});
});

const getPointRevisionEndpoint = '/subjects/getpointrevision';
describe(`GET ${getPointRevisionEndpoint}`, () => {
	test('Unauthorized access (no token), should return 401', () => {
		request(app).get(getPointRevisionEndpoint).expect(401);
	});

	test('Authorized access', async () => {
		const response = await request(app)
			.get(getPointRevisionEndpoint)
			.query({ pointid: pointid })
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
		expect(response.body.length).toBe(0);
	});
});

afterAll(async () => {
	const jwt = jwtDecode(token);
	await supabase.from('points').delete().eq('name', 'This is a test');
	await supabase.from('points').delete().eq('name', 'This is a test #2');
	await supabase.from('points').delete().eq('name', 'This is a test #3');
	await supabase.from('points').delete().eq('name', 'This is a test #4');
	await supabase.from('points').delete().eq('name', 'Test Point');
	await supabase.from('topics').delete().eq('name', 'Test Topic');
	await supabase.from('points').delete().match({ id: pointid });
	await supabase.from('topics').delete().match({ id: topicid });
	await supabase.from('subjects').delete().match({ id: subjectid });
	await supabase.from('subjects').delete().match({ name: 'TestSubject' });
	await supabase.from('student_subjects').delete().eq('studentid', jwt.sub);
});
