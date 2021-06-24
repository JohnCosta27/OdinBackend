const express = require('express');
const { checkJwt } = require('../auth/check-jwt');
const supabase = require('../auth/supabase');
const jwtAuthz = require('express-jwt-authz');
const { getDbErrorMessage, getSuccessMessage } = require('./messages.service');

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
	jwtAuthz(['create:subjects'], { customScopeKey: 'permissions' }),
	async (req, res) => {

	}
);

subjects.get('/getall', async (req, res) => {
	const { data, error } = await supabase.from('subjects').select('*');
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

subjects.get('/getalltopics', async (req, res) => {
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

module.exports = subjects;
