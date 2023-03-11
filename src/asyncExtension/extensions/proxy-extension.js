#!/usr/bin/env node
const http = require('http');
(async () => {
  const baseUrl = `http://${process.env.AWS_LAMBDA_RUNTIME_API}/2020-01-01/extension`;
  const keepAliveAgent = new http.Agent({ keepAlive: true });
  const servers = new Set();

  const getCurrentRequestContext = (() => {
    let current;
    return (uniqueEventName) => {
      if (!current) current = { logsQueue: [] };
      if (!uniqueEventName) return current;
      if (current[uniqueEventName]) current = { logsQueue: [] };
      current[uniqueEventName] = true;
      return current;
    };
  })();

  let internalEventDeferred;
  let resolveInternalEventDeferred;

  const monitorInternalEvents = () => {
    const internalEventDone = () => {
      if (resolveInternalEventDeferred) resolveInternalEventDeferred();
      internalEventDeferred = resolveInternalEventDeferred = null;
    };
    servers.add(
      http
        .createServer((request, response) => {
          let body = '';
          request.on('data', (data) => {
            body += data;
          });
          request.on('end', async () => {
            response.writeHead(200, '');
            response.end('OK');
            console.log('ASYNC_HANDLER', process.env.ASYNC_HANDLER);
            if (process.env.ASYNC_HANDLER) {
              const handler = require(`/var/task/${process.env.ASYNC_HANDLER}`);
              const parsedBody = JSON.parse(body);
              await handler(parsedBody.event, parsedBody.context);
            }
            internalEventDone();
          });
        })
        .listen(2772)
    );
  };

  const monitorEvents = async (extensionIdentifier) => {
    // Events lifecycle handler
    const waitForEvent = async () => {
      const event = await new Promise((resolve, reject) => {
        const request = http.request(
          `${baseUrl}/event/next`,
          {
            agent: keepAliveAgent,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Lambda-Extension-Identifier': extensionIdentifier,
            },
          },
          (response) => {
            if (response.statusCode !== 200) {
              reject(new Error(`Unexpected register response status code: ${response.statusCode}`));
              return;
            }
            response.setEncoding('utf8');
            let result = '';
            response.on('data', (chunk) => {
              result += String(chunk);
            });
            response.on('end', () => {
              resolve(JSON.parse(result));
            });
          }
        );
        request.on('error', reject);
        request.end();
      });
      switch (event.eventType) {
        case 'SHUTDOWN':
          await Promise.resolve();
          break;
        case 'INVOKE':
          if (!internalEventDeferred) {
            internalEventDeferred = new Promise((resolve) => {
              resolveInternalEventDeferred = resolve;
            });
          }
          getCurrentRequestContext('invoke');
          await Promise.resolve(internalEventDeferred).then(waitForEvent);
          break;
        default:
          throw new Error(`unknown event: ${event.eventType}`);
      }
    };
    await waitForEvent();
  };

  // Register extension
  await new Promise((resolve, reject) => {
    const postData = JSON.stringify({ events: ['INVOKE', 'SHUTDOWN'] });
    const request = http.request(
      `${baseUrl}/register`,
      {
        agent: keepAliveAgent,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Lambda-Extension-Name': 'proxy-extension.js',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Unexpected register response status code: ${response.statusCode}`));
          return;
        }

        const extensionIdentifier = response.headers['lambda-extension-identifier'];
        monitorInternalEvents();
        resolve(
          Promise.all([
            monitorEvents(extensionIdentifier),
          ])
        );
      }
    );
    request.on('error', reject);
    request.write(postData);
    request.end();
  });
  for (const server of servers) server.close();
  process.exit();
})().catch((error) => {
  // Ensure to crash extension process on unhandled rejection
  process.nextTick(() => {
    throw error;
  });
});
