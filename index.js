const app = require('./app');
const { serverPort } = require('./config/env.dev');
app.listen(serverPort, () => console.log(`API Server listening on port ${serverPort}`));