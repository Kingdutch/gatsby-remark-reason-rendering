const visit = require('unist-util-visit');

/**
 * Filters out the reason code snippet nodes from a markdown AST.
 *
 * @param markdownAST
 *   The AST of the markdown document.
 * @return {[{node, index, parent}...]}
 *   An array with entries of the found node, its index and its parent node.
 */
function filterReasonSnippets(markdownAST) {
  let codeblocks = [];

  // Plugins can be asynchronous but visit itself is synchronous.
  // Therefore first collect all the code nodes, later return a promise in which
  // they are processed.
  visit(markdownAST, 'code', (node, index, parent) => {
    // Skip non-reason code snippets.
    if (node.lang !== 'reason') {
      return;
    }

    // Skip empty codeblocks.
    if (!node.value.trim().length) {
      return;
    }
    codeblocks.push({node, index, parent});
  });

  return codeblocks;
}

module.exports = filterReasonSnippets;