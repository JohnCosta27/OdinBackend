const express = require('express');
const { checkJwt } = require('../auth/check-jwt');
const supabase = require('../auth/supabase');
const jwtAuthz = require('express-jwt-authz');
const jwtDecode = require('jwt-decode');
const {
	getDbErrorMessage,
	getSuccessMessage,
	getMissingParametersError,
	getError,
} = require('./messages.service');
const { checkUndefined, checkError } = require('./utilities.service');
const progress = express.Router();

/**
 * !Very dirty query.
 */
progress.get('/get', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	const { data, error } = await supabase
		.from('student_points')
		.select('*, points (*, topics (*, subjects(*)))')
		.match({ student_id: jwt.sub });
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

progress.get(
	'/getuserprogress',
	checkJwt,
	jwtAuthz(['read:users'], { customScopeKey: 'permissions' }),
	async (req, res) => {
		const { data, error } = await supabase
			.from('student_points')
			.select('*, points (*, topics (*, subjects(*)))')
			.match({ student_id: req.query.studentid });
		if (error != undefined) {
			res.status(400).send(getDbErrorMessage(error));
		} else {
			res.status(200).send(data);
		}
	}
);

progress.get('/getprogressinsubject', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	const { data, error } = await supabase.rpc(
		'get_points_from_subject_student',
		{
			studentid: jwt.sub,
			givensubjectid: req.query.subjectid,
		}
	);

	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		let returnData = [];
		for (let point of data) {
			let found = false;
			for (let topic of returnData) {
				if (topic.topicid == point.topicid) {
					topic.points.push(point);
					found = true;
					break;
				}
			}

			if (!found) {
				returnData.push({ topicid: point.topicid, points: [point] });
			}
		}

		res.status(200).send(getSuccessMessage());
	}
});

progress.post('/add', checkJwt, async (req, res) => {
	let points = [];
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	try {
		for (let point of req.body.points) {
			points.push({ points_id: point, student_id: jwt.sub });
		}

		const { data, error } = await supabase
			.from('student_points')
			.insert(points);
		if (error != undefined) {
			res.status(400).send(getDbErrorMessage(error));
		} else {
			res.status(200).send(data);
		}
	} catch (error) {
		res.status(400).send(getError(error));
	}
});

progress.post('/addsingular', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	const { date, error } = await supabase.from('student_points').insert([
		{
			points_id: req.body.points_id,
			student_id: jwt.sub,
			datetime: req.body.datetime,
		},
	]);
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(getSuccessMessage());
	}
});

module.exports = progress;
