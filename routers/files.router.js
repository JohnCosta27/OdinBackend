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
const upload = multer({ storage: storage });
const axios = require('axios');
const bucketName = 'notes';
const path = `${supabase.storage.url}/object/${bucketName}/`;
const getPath = `${supabase.storage.url}/object/authenticated/${bucketName}/`;
const headers = supabase.storage.headers;
const FormData = require('form-data');
const request = require('request');
const sizeOf = require('buffer-image-size');
const files = express.Router();

/**
 * *Supabase is in the process of allowing server-side uploading without these requests
 * !When that happens this will have to be changed but for now it works
 */

files.post('/upload', checkJwt, upload.single('note'), async (req, res) => {
	try {
		const dimensions = sizeOf(req.file.buffer);
		const createNote = await createNoteDb(
			req.file.originalname,
			dimensions.width,
			dimensions.height
		);
		if (createNote.error != undefined) {
			res.send(getDbErrorMessage(createNote.error));
		} else {
			const { data, error } = await supabase.from('point_notes').insert([
				{
					noteid: createNote.data[0].id,
					pointid: req.body.pointid,
				},
			]);
			if (error != undefined) {
				res.send(getDbErrorMessage(error));
			} else {
				const formData = {
					file: {
						value: req.file.buffer,
						options: {
							filename: createNote.data[0].id,
							contentType: req.file.mimetype,
						},
					},
				};
				const options = {
					url: path + createNote.data[0].id,
					headers: supabase.storage.headers,
					formData: formData,
				};
				request.post(options);
				res.send(getSuccessMessage());
			}
		}
	} catch (error) {
		res.status(400).send(getDbErrorMessage());
	}
});

files.get('/getnotes', checkJwt, async (req, res) => {
	const { data, error } = await supabase
		.from('point_notes')
		.select('*, notes (*)')
		.match({ pointid: req.query.pointid });

	if (error != undefined) {
		res.send(getDbErrorMessage(error));
	} else {
		res.send(data);
	}
});

const createNoteDb = async (filename, width, height) => {
	const { data, error } = await supabase
		.from('notes')
		.insert([
			{ original_file_name: filename, width: width, height: height },
		]);
	return { data: data, error: error };
};

module.exports = files;
