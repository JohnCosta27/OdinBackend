const express = require('express');
const { checkJwt } = require('../auth/check-jwt');
const supabase = require('../auth/supabase');
const jwtAuthz = require('express-jwt-authz');
const jwtDecode = require('jwt-decode');
const {
	getDbErrorMessage,
	getSuccessMessage,
	getMissingParametersError,
} = require('./messages.service');
const { checkUndefined, checkError } = require('./utilities.service');

const subjects = express.Router();

subjects.post(
	'/create',
	checkJwt,
	jwtAuthz(['create:subjects'], { customScopeKey: 'permissions' }),
	async (req, res) => {
		const { error } = await supabase.from('subjects').insert([
			{
				name: req.body.name,
				examboard: req.body.examboard,
				level: req.body.level,
			},
		]);

		if (error != undefined) {
			res.status(400).send(getDbErrorMessage(error));
		} else {
			res.status(200).send(getSuccessMessage());
		}
	}
);

subjects.post(
	'/createpoints',
	checkJwt,
	jwtAuthz(['create:subjectpoints'], { customScopeKey: 'permissions' }),
	async (req, res) => {
		if (
			checkUndefined([req.body.topic, req.body.subject, req.body.points])
		) {
			res.status(400).send(getMissingParametersError());
		} else {
			const pointsArray = req.body.points.split('\n');
			let insertData = [];

			//Topic == 1, means new topic
			if (req.body.topic == 1) {
				const { data, error } = await supabase.from('topics').insert([
					{
						name: req.body.newTopic,
						subjectid: req.body.subject,
					},
				]);
				if (error != undefined) {
					res.status(400).send(getDbErrorMessage(error));
				} else {
					for (let point of pointsArray) {
						insertData.push({ topicid: data[0].id, name: point });
					}

					const { data2, error2 } = await supabase
						.from('points')
						.insert(insertData);

					if (error2 != undefined) {
						res.status(400).send(getDbErrorMessage(error));
					} else {
						res.status(200).send(getSuccessMessage());
					}
				}
			} else {
				for (let point of pointsArray) {
					insertData.push({ topicid: req.body.topic, name: point });
				}

				const { data, error } = await supabase
					.from('points')
					.insert(insertData);

				if (error != undefined) {
					res.status(400).send(getDbErrorMessage(error));
				} else {
					res.status(200).send(getSuccessMessage());
				}
			}
		}
	}
);

subjects.get('/getall', checkJwt, async (req, res) => {
	const { data, error } = await supabase.from('subjects').select('*');
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});
/**
 * Title is funnt
 * * this gets the subjects that the user doesn't take
 * Lives in subjects but might move to users
 */
subjects.get('/getnew', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	const { data, error } = await supabase.rpc('get_new', {
		student_id: jwt.sub,
	});
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

subjects.get('/get', checkJwt, async (req, res) => {
	const { data, error } = await supabase
		.from('topics')
		.select('*, points (*), subjects (*)')
		.match({ subjectid: req.query.subjectid });

	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

subjects.get('/getusersubjects', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	const { data, error } = await supabase
		.from('student_subjects')
		.select('subjects (*)')
		.match({ studentid: jwt.sub });
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

subjects.get('/getalltopics', checkJwt, async (req, res) => {
	const { data, error } = await supabase
		.from('topics')
		.select('*')
		.match({ subjectid: req.query.subjectid });
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

subjects.get('/getpoints', checkJwt, async (req, res) => {
	try {
		const { data, error } = await supabase
			.from('points')
			.select('*')
			.match({ topicid: req.query.topicid });
		if (error != undefined) {
			res.status(400).send(getDbErrorMessage(error));
		} else {
			res.status(200).send(data);
		}
	} catch (error) {
		res.status(400).send(getDbErrorMessage(error));
	}
});

subjects.get('/getpoint', checkJwt, async (req, res) => {
	try {
		const { data, error } = await supabase
			.from('points')
			.select('*, topics (*)')
			.match({ id: req.query.pointid });
		if (error != undefined) {
			res.status(400).send(getDbErrorMessage(error));
		} else {
			res.status(200).send(data);
		}
	} catch (error) {
		res.status(400).send(getDbErrorMessage(error));
	}
});

module.exports = subjects;
