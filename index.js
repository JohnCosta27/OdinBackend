const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { clientOrigins, serverPort } = require('./config/env.dev');
const { checkJwt } = require('./auth/check-jwt');

const app = express();
const apiRouter = express.Router();

/**
 *  App Configuration
 */

app.use(helmet());
app.use(cors({ origin: clientOrigins }));
app.use(express.json());

app.use('/api', apiRouter);

apiRouter.get('/public', (req, res) => {
    res.status(200).send({message: "This is a public method"});
});

apiRouter.get('/protected', checkJwt, (req, res) => {
    res.status(200).send({message: "This is a protected method"});
})

app.listen(serverPort, () =>
	console.log(`API Server listening on port ${serverPort}`)
);
