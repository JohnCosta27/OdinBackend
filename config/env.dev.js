const dotenv = require('dotenv');

dotenv.config({path: '/home/johnc/Code/Odin/backend/.env'});

const audience = process.env.AUTH0_AUDIENCE;
const domain = process.env.AUTH0_DOMAIN;
const serverPort = process.env.SERVER_PORT;
const clientOriginUrl = process.env.CLIENT_ORIGIN_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const testClientId = process.env.ODIN_CLIENT_ID;
const testClientSecret = process.env.ODIN_CLIENT_SECRET;
const testClientOpId = process.env.ODIN_OP_CLIENT_ID;
const testClientOpSecret = process.env.ODIN_OP_CLIENT_SECRET;
const useSavedToken = process.env.USE_SAVED;
const testToken = process.env.TEST_TOKEN;
const opTestToken = process.env.OP_TEST_TOKEN;

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

if (!testClientOpId) {
    throw new Error (
        '.env is missing the definition of a ODIN_OP_CLIENT_ID environmental variable'
    )
}

if (!testClientOpSecret) {
    throw new Error (
        '.env is missing the definition of a ODIN_OP_CLIENT_SECRET environmental variable'
    )
}

if (!useSavedToken) {
    throw new Error(
        '.env is missing the definition of an USE_SAVED environmental variable'
    )
}

if (!testToken) {
    throw new Error(
        '.env is missing the definition of an TEST_TOKEN environmental variable'
    )
}

if (!opTestToken) {
    throw new Error(
        '.env is missing the definition of an OP_TEST_TOKEN environmental variable'
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
    testClientSecret,
    testClientOpId,
    testClientOpSecret,
    useSavedToken,
    testToken,
    opTestToken
};
