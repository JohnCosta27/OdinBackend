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

progress.post('/add', checkJwt, async (req, res) => {
	let points = [];
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	for (let point of req.body.points) {
		points.push({ points_id: point, student_id: jwt.sub });
	}

	const { data, error } = await supabase
		.from('student_points')
		.insert(points);
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(getSuccessMessage());
	}
});

module.exports = progress;