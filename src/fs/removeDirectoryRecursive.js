const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const projectDir = path.dirname(path.dirname(__dirname));

/**
 * Remove a directory and all of its contents.
 *
 * @param dir
 *   The directory to remove.
 * @return {Promise<void>}
 */
async function removeDirectoryRecursive(dir) {
  if (path.relative(projectDir, dir).indexOf('..') === 0) {
    throw new Error(`${dir} is outside of project directory ${projectDir}`);
  }

  if (fsSync.existsSync(dir)) {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const curPath = path.join(dir, file);
      if ((await fs.lstat(curPath)).isDirectory()) {
        await removeDirectoryRecursive(curPath);
      }
      else {
        await fs.unlink(curPath);
      }
    }

    await fs.rmdir(dir);
  }
}

module.exports = removeDirectoryRecursive;
