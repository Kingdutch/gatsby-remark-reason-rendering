const fs = require('fs').promises;
const fsSync = require('fs');

const SNIPPET_PLACEHOLDER = '%SNIPPET%';

/**
 * Retrieves an embed snippet from the file system for the specified style.
 *
 * @param style
 *   The chosen embed style for the snippet.
 * @param embedStyles
 *   A list of user configured embedStyles.
 * @param defaultEmbedStyles
 *   The plugin's default list of embed styles
 * @return {Promise<string>}
 *   The snippet with a SNIPPET_PLACEHOLDER that can be replaced by compiled
 *   code.
 */
async function getEmbedSnippet(style, embedStyles, defaultEmbedStyles) {
  // TODO: Also lookup the path of the embed code from plugin options.
  const embedStylePath = defaultEmbedStyles[style];
  if (!embedStylePath) {
    throw new Error(`Could not embed snippet in style ${style}: style not defined`);
  }

  if (!fsSync.existsSync(embedStylePath)) {
    throw new Error(`Could not embed snippet in style ${style}: ${embedStylePath} not found`);
  }

  const embedStyleCode = (await fs.readFile(embedStylePath)).toString('utf-8');

  if (embedStyleCode.indexOf(SNIPPET_PLACEHOLDER) === -1) {
    throw new Error(`Could not find snippet placeholder (${SNIPPET_PLACEHOLDER}) in style ${style}`);
  }

  return embedStyleCode
}

module.exports = {
  SNIPPET_PLACEHOLDER,
  getEmbedSnippet,
};
