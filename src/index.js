const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { exec } = require('child_process');
const visit = require('unist-util-visit');
const webpack = require('webpack');

const projectDir = path.dirname(__dirname);
const embedFile = path.join(projectDir, "static", "embed.js");
const tmpPath = path.join(projectDir, 'tmp');
const bsFile = path.join(tmpPath, 'bsconfig.json');
const tmpFile = path.join(tmpPath, 'Snippet.re');
const webpackOutFile = 'compiled.js';

const bsConfig = JSON.stringify({
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
      // "module": "commonjs",
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
}, null, 2);

const webpackConfig = {
  mode: 'development',
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

function ensureDirectory(dir) {
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir);
  }
}

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

async function execPromise(command, options) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      resolve(stdout, stderr);
    })
  })
}

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

async function compileSnippet(snippet, cb) {
  // Prepare our reason code compilation directory.
  ensureDirectory(tmpPath);
  await fs.writeFile(bsFile, bsConfig);
  await fs.writeFile(tmpFile, snippet);

  // Use BSB to compile the code.
  await execPromise("bsb -make-world", { cwd: tmpPath });

  // Prepare our embed snippet that will load the compiled Reason code.
  await fs.writeFile(
    path.join(tmpPath, "embed.js"),
    await fs.readFile(embedFile)
  );

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

module.exports = async ({markdownAST}, pluginOptions) => {
  let codeblocks = [];

  // Plugins can be asynchronous but visit itself is synchronous.
  // Therefore first collect all the code nodes, later return a promise in which
  // they are processed.
  visit(markdownAST, 'code', (node, index, parent) => {
    // Skip empty codeblocks.
    // TODO: Skip non-reason codeblocks.
    if (!node.value.trim().length) {
      return;
    }
    codeblocks.push({node, index, parent});
  });

  // Loop over the found nodes and transform their parent elements which are
  // members of markdownAST.
  for (const { node, index, parent } of codeblocks) {
    // TODO: Properly handle error catching (for exec errors) here.
    // TODO: Implement syntax error handling (error output from bsb).
    const embedSnippet = await compileSnippet(node.value.trim());

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
