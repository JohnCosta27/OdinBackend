const express = require('express');
const { checkJwt } = require('../auth/check-jwt');
const { getDbErrorMessage } = require('./messages.service');
const supabase = require('../auth/supabase');
const jwtDecode = require('jwt-decode');
const usercontent = express.Router();

usercontent.post('/createnote', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	const { data, error } = await supabase.rpc('create_text_note', {
		title: req.body.title,
		notecontent: req.body.content,
		studentid: jwt.sub,
	});
	let insertData = [];
	for (let point of req.body.points) {
		insertData.push({ point_id: point, note_id: data });
	}
	const { pointData, pointError } = await supabase.from('text_point_notes').insert(insertData);

	if (pointError != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

module.exports = usercontent;
