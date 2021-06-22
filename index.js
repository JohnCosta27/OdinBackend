const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { clientOrigins, serverPort } = require('./config/env.dev');
const { checkJwt } = require('./auth/check-jwt');
const jwtDecode = require('jwt-decode');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const apiRouter = express.Router();

const supabase = createClient(
	'https://sbogvmcjtjrgffqnydly.supabase.co',
	process.env.SUPABASE_KEY
);

/**
 *  App Configuration
 */

app.use(helmet());
app.use(cors({ origin: clientOrigins }));
app.use(express.json());

app.use('/api', apiRouter);

apiRouter.get('/public', (req, res) => {
	res.status(200).send({ message: 'This is a public method' });
});

/**
 * API Sync method
 * * Adds new users to the database, or updates their latest login
 * TODO: Login times in database (later down the line)
 */
apiRouter.get('/sync', checkJwt, async (req, res) => {
	const jwt = jwtDecode(req.headers.authorization.substring(7));

	const { data, error } = await supabase
		.from('users')
		.insert([{ id: jwt.sub }]);

	res.status(200).send({ message: 'Synchronisation successful' });
});

apiRouter.get('/protected', checkJwt, (req, res) => {
	res.status(200).send({ message: 'This is a protected method' });
});

app.listen(serverPort, () =>
	console.log(`API Server listening on port ${serverPort}`)
);
