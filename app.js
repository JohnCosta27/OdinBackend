const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { clientOrigins } = require('./config/env.dev');
const { checkJwt } = require('./auth/check-jwt');
const jwtDecode = require('jwt-decode');
const jwtAuthz = require('express-jwt-authz');
const supabase = require('./auth/supabase');

const subjectRouter = require('./routers/subjects.router');
const progressRouter = require('./routers/progress.router');
const filesRouter = require('./routers/files.router');
const usersRouter = require('./routers/users.router');
const usercontentRouter = require('./routers/usercontent.router');
const app = express();
const apiRouter = express.Router();

/**
 *  App Configuration
 */

app.use(helmet());
app.use(cors({ origin: clientOrigins }));
app.use(express.json());

app.use('/api', apiRouter);
app.use('/subjects', subjectRouter);
app.use('/progress', progressRouter);
app.use('/files', filesRouter);
app.use('/users', usersRouter);
app.use('/usercontent', usercontentRouter)

/**
 * API Sync method
 * * Adds new users to the database, or updates their latest login
 * TODO: Login times in database (later down the line)
 */
apiRouter.get('/sync', checkJwt, async (req, res) => {
	//* When user accesses the system, an account is created. If user is already created
	//* Then there will be an error.
	const jwt = jwtDecode(req.headers.authorization.substring(7));
	const { data, error } = await supabase.from('users').insert([{ id: jwt.sub }]);
	res.status(200).send({status: 'Sync complete'});
});

module.exports = app;