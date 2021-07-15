const axios = require('axios').default;
const { getRequestFailed } = require('../routers/messages.service');
const { domain, clientId, clientSecret } = require('../config/env.dev');

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

const getAllUsers = async () => {
	const accessToken = await getApiAcessToken();
	const options = {
		url: `https://${domain}/api/v2/users`,
		headers: { 'content-type': 'application/json', 'Authorization': `Bearer ${accessToken.access_token}` }
	};
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		return getRequestFailed();
	}
}
module.exports = { getApiAcessToken, getAllUsers }