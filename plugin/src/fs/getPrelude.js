const fs = require('fs').promises;
const fsSync = require('fs');

/**
 * Retrieves the specified prelude snippet from the file system.
 *
 * @param name
 *   The name of the prelude.
 * @param preludes
 *   A list of user configured preludes.
 * @param defaultPreludes
 *   The plugin's default list of preludes
 * @return {Promise<string>}
 *   The prelude snippet that imports "./snippet.bs"
 */
async function getPrelude(name, preludes, defaultPreludes) {
  // TODO: Also lookup the path of prelude code from plugin options.
  const preludePath = defaultPreludes[name];
  if (!preludePath) {
    throw new Error(`Could not use prelude ${name}: prelude not defined`);
  }

  if (!fsSync.existsSync(preludePath)) {
    throw new Error(`Could not use prelude ${name}: ${preludePath} not found`);
  }

  return (await fs.readFile(preludePath)).toString('utf-8');
}

module.exports = {
  getPrelude,
};
