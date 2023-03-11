const { waitAndPrint } = require("../../helper/delayed");

module.exports = async (event) => {
  await waitAndPrint({
    prefix: 'longRunning',
    event,
    timeout: 45000,
  });
};