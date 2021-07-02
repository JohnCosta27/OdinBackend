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
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
const axios = require('axios');
const bucketName = 'notes'
const path = `${supabase.storage.url}/object/${bucketName}/`
const headers = supabase.storage.headers

const files = express.Router();

files.post('/upload', checkJwt, upload.single('note'), async (req, res) => {
	console.log(req.file);
	const createNote = await createNoteDb(req.file.originalname)
	if (createNote.error != undefined) {
		res.send(getDbErrorMessage(createNote.error));
	} else {
		const { data, error } = await supabase
			.from('topic_notes')
			.insert([{ noteid: createNote.data[0].id, pointid: req.body.pointid }]);
		if (error != undefined) {
			res.send(getDbErrorMessage(error));
		} else {
			axios({
				method: "POST",
				url: path + req.file.originalname,
				headers: headers,
				data: req.file.buffer,
			  });
			res.send(getSuccessMessage());
		}
	}
});

async function createNoteDb(filename) {
	const { data, error } = await supabase
		.from('notes')
		.insert([{ url: filename }]);
	return { data: data, error: error }
}

module.exports = files;
