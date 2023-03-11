const { waitAndPrint } = require('../helper/delayed');
// This is a helper function exposed by our asyncExtension
// so you can easily forward event and context to your async
// handler
const { sendArgs } = require('/opt/proxy');

const handler = async (event, context) => {
  // This method is required to send the event/context data
  // to the async handler.
  await sendArgs(event, context);
  await waitAndPrint({
    prefix: 'customHandler',
    timeout: 500,
  });
  return {
    message: 'Done doing something',
  };
};

module.exports = { handler };
