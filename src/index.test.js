const plugin = require('./index');
const remark = require('remark');
const markdown = require('remark-parse');

test("remark hasn't changed its AST", () => {
  const snippet = `
    This is some text.
    
    \`\`\`reason
    Code text
    \`\`\`
  `;

  const ast = remark()
    .use(markdown)
    .parse(snippet);

  expect(ast).toMatchSnapshot();
});

test("it properly transforms a single reason snippet", async () => {
  const markdownAST = require('./__fixtures__/reason-single-snippet-ast');

  const transformedAst = await plugin({ markdownAST }, {});
  expect(transformedAst).toMatchSnapshot();
});

test("it properly transforms multiple reason snippets", async () => {
  const markdownAST = require('./__fixtures__/reason-snippet-ast-multiple');

  const transformedAst = await plugin({ markdownAST }, {});
  expect(transformedAst).toMatchSnapshot();
});
