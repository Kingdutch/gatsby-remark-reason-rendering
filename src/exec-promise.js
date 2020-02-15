const { exec } = require('child_process');

/**
 * Runs the child_process.exec command and returns a promise.
 *
 * @param command
 *   The command that should be passed to exec.
 * @param options
 *   The options that should be passed to exec.
 * @return {Promise<unknown>}
 *   A promise that resolves to stdout and rejects to error, stdout and stderr.
 */
async function execPromise(command, options) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        if (stdout) {
          console.log(stdout);
        }
        if (stderr) {
          console.error(stderr);
        }
        return reject(error, stdout, stderr);
      }

      resolve(stdout, stderr);
    })
  })
}

module.exports = execPromise;