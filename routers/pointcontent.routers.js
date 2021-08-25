const express = require('express');
const { checkJwt } = require('../auth/check-jwt');
const {
	getDbErrorMessage,
	getMissingParametersError,
	getSuccessMessage,
} = require('./messages.service');
const supabase = require('../auth/supabase');
const jwtDecode = require('jwt-decode');
const jwtAuthz = require('express-jwt-authz');
const pointcontent = express.Router();

pointcontent.post(
	'/setyoutubevideo',
	checkJwt,
	jwtAuthz(['role:admin'], { customScopeKey: 'permissions' }),
	async (req, res) => {
		if (req.body.videoid == null || req.body.pointid == null) {
			res.status(400).send(getMissingParametersError());
		} else {
			const insertVideo = await supabase
				.from('points')
				.update({ youtubeVideo: req.body.videoid })
				.eq('id', req.body.pointid);

			if (insertVideo.error != null) {
				res.status(400).send(getDbErrorMessage());
			} else {
				res.status(200).send(getSuccessMessage());
			}
		}
	}
);

module.exports = pointcontent;
