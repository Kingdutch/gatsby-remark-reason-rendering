const fs = require('fs');

/**
 * Ensures a directory doesn't exist by creating it if it doesn't.
 *
 * @param dir
 *   The path to the directory that should exist.
 */
function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

module.exports = ensureDirectory;
