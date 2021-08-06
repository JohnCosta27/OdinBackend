const express = require('express');
const { checkJwt } = require('../auth/check-jwt');
const supabase = require('../auth/supabase');
const jwtAuthz = require('express-jwt-authz');
const jwtDecode = require('jwt-decode');
const {
	getDbErrorMessage,
	getSuccessMessage,
	getMissingParametersError,
	getInvalidParameters,
} = require('./messages.service');
const { getAllUsers } = require('../requests/Auth0API.service');
const users = express.Router();

users.post('/addsubject', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));

	const checkSubjectExists = await supabase
		.from('subjects')
		.select('*')
		.match({ id: req.body.subjectid });

	if (checkSubjectExists.error != null) {
		res.status(400).send(getDbErrorMessage(checkSubjectExists.error));
	} else if (checkSubjectExists.data.length == 0) {
		res.status(400).send(getInvalidParameters());
	} else {
		const userHasSubject = await supabase
			.from('student_subjects')
			.select('*')
			.match({ studentid: jwt.sub, subjectid: req.body.subjectid });

		if (userHasSubject.error != null) {
			res.status(400).send(getDbErrorMessage(userHasSubject.error));
		} else if (userHasSubject.data.length != 0) {
			res.status(400).send({ error: 'User already has this subject' });
		} else {
			const { data, error } = await supabase
				.from('student_subjects')
				.insert([
					{ studentid: jwt.sub, subjectid: req.body.subjectid },
				]);
			if (error != undefined) {
				res.status(400).send(getDbErrorMessage(error));
			} else {
				res.status(200).send(data);
			}
		}
	}
});

users.get(
	'/getall',
	checkJwt,
	jwtAuthz(['read:users'], { customScopeKey: 'permissions' }),
	async (req, res) => {
		const data = await getAllUsers();
		if (data.error != undefined) {
			res.status(400).send(data);
		} else {
			res.status(200).send(data);
		}
	}
);

module.exports = users;
