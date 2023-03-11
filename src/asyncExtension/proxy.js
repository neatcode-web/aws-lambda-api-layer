const http = require('http');
const keepAliveAgent = new http.Agent({ keepAlive: true });

const makeRequest = (data) => new Promise((resolve) => {
  const options = {
    agent: keepAliveAgent,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };
  const req = http.request(`http://127.0.0.1:2772/trace`, options, resolve);
  req.on('error', err => {
    console.error('Error: ', err.message)
  });
  req.write(data);
  req.end();
});

const sendArgs = async (event, context) => {
  await makeRequest(JSON.stringify({ event, context }));
}

const handler = async (event, context) => {
  await makeRequest(JSON.stringify({ event, context }));
  try {
    return JSON.parse(process.env.CUSTOM_RES);
  } catch(error) {
    return process.env.CUSTOM_RES || {
      statusCode: 200,
      body: 'ok',
    };
  }
};

module.exports = { handler, sendArgs };
