const axios = require('axios').default;
const { getRequestFailed } = require('../routers/messages.service');
const {
	domain,
	clientId,
	clientSecret,
	testClientId,
	testClientSecret,
	testClientOpId,
	testClientOpSecret,
	useSavedToken,
	testToken,
	opTestToken,
} = require('../config/env.dev');

const getApiAcessToken = async () => {
	const options = {
		method: 'POST',
		url: `https://${domain}/oauth/token`,
		headers: { 'content-type': 'application/json' },
		data: {
			grant_type: 'client_credentials',
			client_id: clientId,
			client_secret: clientSecret,
			audience: `https://${domain}/api/v2/`,
		},
	};

	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		return getRequestFailed();
	}
};

const getBackendTestToken = async () => {
	if (useSavedToken == 1) {
		return JSON.parse(testToken);
	}

	const options = {
		method: 'POST',
		url: `https://johncosta027.eu.auth0.com/oauth/token`,
		headers: { 'content-type': 'application/json' },
		data: {
			grant_type: 'client_credentials',
			client_id: testClientId,
			client_secret: testClientSecret,
			audience: `https://odin.backend/`,
		},
	};

	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		return getRequestFailed();
	}
};

const getBackendTestOpToken = async () => {
	if (useSavedToken == 1) {
		return JSON.parse(opTestToken);
	}

	const options = {
		method: 'POST',
		url: `https://johncosta027.eu.auth0.com/oauth/token`,
		headers: { 'content-type': 'application/json' },
		data: {
			grant_type: 'client_credentials',
			client_id: testClientOpId,
			client_secret: testClientOpSecret,
			audience: `https://odin.backend/`,
		},
	};

	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		return getRequestFailed();
	}
};

const getAllUsers = async () => {
	const accessToken = await getApiAcessToken();
	const options = {
		url: `https://${domain}/api/v2/users`,
		headers: {
			'content-type': 'application/json',
			Authorization: `Bearer ${accessToken.access_token}`,
		},
	};
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		return getRequestFailed();
	}
};
module.exports = {
	getApiAcessToken,
	getBackendTestToken,
	getAllUsers,
	getBackendTestOpToken,
};
