const dotenv = require('dotenv');

dotenv.config();

const audience = process.env.AUTH0_AUDIENCE;
const domain = process.env.AUTH0_DOMAIN;
const serverPort = process.env.SERVER_PORT;
const clientOriginUrl = process.env.CLIENT_ORIGIN_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const testClientId = process.env.ODIN_CLIENT_ID;
const testClientSecret = process.env.ODIN_CLIENT_SECRET;

if (!audience) {
    throw new Error(
        '.env is missing the definition of an AUTH0_AUDIENCE environmental variable'
    );
}

if (!domain) {
    throw new Error(
        '.env is missing the definition of an AUTH0_DOMAIN environmental variable'
    );
}

if (!serverPort) {
    throw new Error(
        '.env is missing the definition of a API_PORT environmental variable'
    );
}

if (!clientOriginUrl) {
    throw new Error(
        '.env is missing the definition of a APP_ORIGIN environmental variable'
    );
}

if (!clientId) {
    throw new Error(
        '.env is missing the definition of a CLIENT_ID environmental variable'
    )
}

if (!clientSecret) {
    throw new Error(
        '.env is missing the definition of a CLIENT_SECRET environmental variable'
    )
}

if (!testClientId) {
    throw new Error (
        '.env is missing the definition of a ODIN_CLIENT_ID environmental variable'
    )
}

if (!testClientSecret) {
    throw new Error (
        '.env is missing the definition of a ODIN_CLIENT_SECRET environmental variable'
    )
}

const clientOrigins = ['http://localhost:4040'];

module.exports = {
    audience,
    domain,
    serverPort,
    clientOriginUrl,
    clientOrigins,
    clientId,
    clientSecret,
    testClientId,
    testClientSecret
};