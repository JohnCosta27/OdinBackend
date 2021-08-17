const express = require('express');
const { checkJwt } = require('../auth/check-jwt');
const supabase = require('../auth/supabase');
const jwtAuthz = require('express-jwt-authz');
const jwtDecode = require('jwt-decode');
const {
	getDbErrorMessage,
	getSuccessMessage,
	getMissingParametersError,
	getAlreadyExists,
	getError,
} = require('./messages.service');
const { checkUndefined, checkError } = require('./utilities.service');

const subjects = express.Router();

subjects.post(
	'/create',
	checkJwt,
	jwtAuthz(['role:admin'], { customScopeKey: 'permissions' }),
	async (req, res) => {
		if (
			checkUndefined([req.body.name, req.body.examboard, req.body.level])
		) {
			res.status(400).send(getMissingParametersError());
		} else {
			const checkSubjectExists = await supabase
				.from('subjects')
				.select('*')
				.match({
					name: req.body.name,
					examboard: req.body.examboard,
					level: req.body.level,
				});

			if (checkSubjectExists.data.length > 0) {
				res.status(400).send(getAlreadyExists());
			} else {
				const insertSubject = await supabase.from('subjects').insert([
					{
						name: req.body.name,
						examboard: req.body.examboard,
						level: req.body.level,
					},
				]);

				if (insertSubject.error != undefined) {
					res.status(400).send(
						getDbErrorMessage(insertSubject.error)
					);
				} else {
					res.status(200).send(insertSubject.data);
				}
			}
		}
	}
);

subjects.post(
	'/createpoints',
	checkJwt,
	jwtAuthz(['create:subjectpoints'], { customScopeKey: 'permissions' }),
	async (req, res) => {
		console.log(req.body);
		if (
			checkUndefined([req.body.topic, req.body.subject, req.body.points])
		) {
			res.status(400).send(getMissingParametersError());
		} else {
			try {
				const pointsArray = req.body.points.split('\n');
				let insertData = [];

				//Topic == 1, means new topic
				if (req.body.topic == 1) {
					if (checkUndefined([req.body.newTopic])) {
						res.status(400).send(getMissingParametersError());
					} else {
						console.log(req.body.subject);
						const insertNewTopic = await supabase
							.from('topics')
							.insert([
								{
									name: req.body.newTopic,
									subjectid: req.body.subject,
								},
							]);
						if (insertNewTopic.error != undefined) {
							res.status(400).send(
								getDbErrorMessage(insertNewTopic.error)
							);
						} else {
							for (let point of pointsArray) {
								insertData.push({
									topicid: insertNewTopic.data[0].id,
									name: point,
								});
							}

							const insertPoints = await supabase
								.from('points')
								.insert(insertData);

							if (insertPoints.error != undefined) {
								res.status(400).send(
									getDbErrorMessage(insertPoints.error)
								);
							} else {
								res.status(200).send(insertNewTopic.data);
							}
						}
					}
				} else {
					for (let point of pointsArray) {
						insertData.push({
							topicid: req.body.topic,
							name: point,
						});
					}

					const insertPoints = await supabase
						.from('points')
						.insert(insertData);

					if (insertPoints.error != undefined) {
						res.status(400).send(
							getDbErrorMessage(insertPoints.error)
						);
					} else {
						res.status(200).send(getSuccessMessage());
					}
				}
			} catch (error) {
				res.status(400).send(getError(error));
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
 * Title is funny
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

subjects.get('/getpointrevision', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	const { data, error } = await supabase.rpc('get_point_topic_progress', {
		pointid: req.query.pointid,
		studentid: jwt.sub,
	});
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

module.exports = subjects;
