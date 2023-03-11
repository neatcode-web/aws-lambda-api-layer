const waitAndPrint = async ({
  prefix = '',
  timeout = 2000,
  event = '{}',
}) => {
  const wait = () => new Promise((resolve) => {
    console.log(`${prefix ? prefix + ' ' : ''}Begin processing`, JSON.stringify(event));
    setTimeout(() => {
      console.log(`${prefix ? prefix + ' ' : ''}Resolving :)`);
      resolve();
    }, timeout);
  });
  await wait();
}

module.exports = { waitAndPrint };
