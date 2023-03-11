const { waitAndPrint } = require("../../helper/delayed");

module.exports = async (event) => {
  await waitAndPrint({
    prefix: 'customHandlerAsyncExecution',
    event,
    timeout: 6000,
  });
};