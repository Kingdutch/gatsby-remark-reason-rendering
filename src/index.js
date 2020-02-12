const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function removeDirectoryRecursive(dir) {
  if (path.relative(projectDir, dir).indexOf('..') === 0) {
    throw new Error(`${dir} is outside of project directory ${projectDir}`);
  }

  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file, index) => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        removeDirectoryRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}

function compileSnippet(snippet, cb) {
  // Clean up previous attempt.
  // TODO: This should happen at the end but is here for debugging.
  removeDirectoryRecursive(tmpPath);

  // Prepare our reason code compilation directory.
  ensureDirectory(tmpPath);
  fs.writeFileSync(bsFile, bsConfig);
  fs.writeFileSync(tmpFile, snippet);

  // Use BSB to compile the code.
  execSync("bsb -make-world", { cwd: tmpPath });

  // Prepare our embed snippet that will load the compiled Reason code.
  fs.writeFileSync(path.join(tmpPath, "embed.js"), fs.readFileSync(embedFile))

  // Use webpack to make our snippet ready for embedding.
  compiler.run((error, stats) => {
    if (error) {
      console.error("Encountered error", error);
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error("Errors webpacking the compiled code\n", info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn("Errors webpacking the compiled code\n", info.warnings);
    }

    cb(
      fs.readFileSync(
        path.join(tmpPath, webpackOutFile)
      ).toString('utf-8')
    );
  });
}

// TODO: Clean this up to nicer async/await.
module.exports = ({markdownAST}, pluginOptions) => {
  let codeblocks = [];
  let snippets = [];

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

  return new Promise((resolve, reject) => {
    codeblocks.forEach(({ node, index, parent }) => {
      // Create a script node the will run our snippet.
      compileSnippet(node.value.trim(), embedSnippet => {

        // TODO: Make this look prettier, move it in an iframe.
        const scriptNode = {
          type: 'html',
          value: "<script type='text/javascript'>\n" +
            embedSnippet + "\n" +
            "</script>\n",
        };

        // Insert the rendered embed HTML as sibling right before the code snippet.
        parent.children.splice(index, 0, scriptNode);

        // TODO: This only compiles one snippet because it's inside of the
        //  callback from Weblate. Instead that callback should be a nice async/
        //  await function that can be run sequentially before resolving the
        //  main promise.
        resolve(markdownAST);
      });
    });
  });
};
