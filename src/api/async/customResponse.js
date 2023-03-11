const { waitAndPrint } = require("../../helper/delayed");

module.exports = async (event) => {
  await waitAndPrint({
    prefix: 'customResponse',
    event,
    timeout: 2000,
  });
};