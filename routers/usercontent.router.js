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
	const insertTextPoint = await insertTextPointNotes(insertData);

	if (insertTextPoint.error != undefined) {
		res.status(400).send(getDbErrorMessage(insertTextPoint.error));
	} else {
		res.status(200).send(insertTextPoint.data);
	}
});

const insertTextPointNotes = async (insertData) => {
	const { data, error } = await supabase
		.from('text_point_notes')
		.insert(insertData);
	return { data: data, error: error };
};

usercontent.get('/getusernotepoint', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	const { data, error } = await supabase.rpc('get_user_text_notes', {
		givenstudentid: jwt.sub,
		givenpointid: req.query.pointid,
	});
	console.log(data);
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

usercontent.get('/getusernotes', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	let { data, error } = await supabase
		.from('student_notes')
		.select('*, text_notes (*)')
		.match({ studentid: jwt.sub });
	data.sort(function (a, b) {
		return (
			new Date(a.text_notes.datetime) - new Date(b.text_notes.datetime)
		);
	});
	if (data.length > 5) {
		data = data.slice(0, 5);
	}
	if (error != undefined) {
		res.status(400).send(getDbErrorMessage(error));
	} else {
		res.status(200).send(data);
	}
});

module.exports = usercontent;
