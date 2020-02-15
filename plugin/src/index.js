const fs = require('fs').promises;
const path = require('path');
const webpack = require('webpack');

const annotationParser = require('./annotation-parser');
const execPromise = require('./exec-promise');
const ensureDirectory = require('./fs/ensureDirectory');
const removeDirectoryRecursive = require('./fs/removeDirectoryRecursive');
const filterReasonSnippets = require('./markdown/filterReasonSnippets');

const projectDir = path.dirname(__dirname);
const embedFile = path.join(projectDir, "static", "prelude/react-component.js");
const tmpPath = path.join(projectDir, 'tmp');
const bsFile = path.join(tmpPath, 'bsconfig.json');
const tmpFile = path.join(tmpPath, 'Snippet.re');
const webpackOutFile = 'compiled.js';

const bsConfig = {
  "name": "tmp",
  "reason": {
    "react-jsx": 3
  },
  "bsc-flags": ["-bs-super-errors"],
  "sources": [
    {
      "dir": ".",
      "subdirs": false
    }
  ],
  "package-specs": [
    {
      "module": "es6",
      "in-source": true
    }
  ],
  "suffix": ".bs.js",
  "namespace": true,
  "bs-dependencies": [
    "reason-react"
  ],
  "ppx-flags": [],
  "refmt": 3
};

const webpackConfig = {
  mode: 'development',
  cache: false,
  devtool: false,
  entry: path.join(tmpPath, "embed.js"),
  output: {
    path: tmpPath,
    filename: webpackOutFile,
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};

const compiler = webpack(webpackConfig);

function compilerRunPromise() {
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error);
      }

      resolve(stats);
    });
  })
}

async function compileSnippet(snippet, bsConfig) {
  // Prepare our reason code compilation directory.
  ensureDirectory(tmpPath);
  await fs.writeFile(bsFile, JSON.stringify(bsConfig, null, 2));
  await fs.writeFile(tmpFile, snippet);

  // Use BSB to compile the code.
  await execPromise("bsb -make-world", { cwd: tmpPath });

  // Prepare our embed snippet that will load the compiled Reason code.
  await fs.writeFile(
    path.join(tmpPath, "embed.js"),
    await fs.readFile(embedFile)
  );

  // TODO: Allow configuring of how the code is embedded.
  // Use webpack to make our snippet ready for embedding.
  const stats = await compilerRunPromise();

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error("Errors webpacking the compiled code\n", info.errors);
  }

  if (stats.hasWarnings()) {
    console.warn("Errors webpacking the compiled code\n", info.warnings);
  }

  const fileContents = await fs.readFile(path.join(tmpPath, webpackOutFile));

  // Clean up.
  await removeDirectoryRecursive(tmpPath);

  return fileContents.toString('utf-8');
}

/**
 * Adds executable scripts above Reason code snippets in markdown files.
 *
 * @param markdownAST
 *   The AST of the markdown document.
 * @param pluginOptions
 *   The options for this plugin.
 * @return {Promise<*>}
 *   A promise that resolves to the modified AST of the markdown document.
 */
module.exports = async ({markdownAST}, pluginOptions) => {
  const codeblocks = filterReasonSnippets(markdownAST);

  // Loop over the found nodes and transform their parent elements which are
  // members of markdownAST.
  for (const { node, index, parent } of codeblocks) {
    const snippet = node.value.trim();

    // Find any annotations used to configure our compilation.
    const annotations = annotationParser(snippet);
    // Create a copy of the config that we can modify.
    let config = { ...bsConfig };

    // Add any specified dependencies.
    if (annotations['dependency']) {
      config["bs-dependencies"] = [...config["bs-dependencies"], ...annotations['dependency']];
    }

    // TODO: Properly handle error catching (for exec errors) here.
    // TODO: Implement syntax error handling (error output from bsb).
    const embedSnippet = await compileSnippet(snippet, config);

    // TODO: Make this look prettier, move it in an iframe.
    const scriptNode = {
      type: 'html',
      value: "<script type='text/javascript'>\n" +
        embedSnippet + "\n" +
        "</script>\n",
    };

    // Insert the rendered embed HTML as sibling right before the code snippet.
    parent.children.splice(index, 0, scriptNode);
  }

  // We use Promise.all to execute all transforms in series. The module calling
  // this plugin expects to receive the transformed markdownAST so we return it
  // as final promise.
  return markdownAST;
};
