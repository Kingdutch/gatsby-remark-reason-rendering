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
  const markdownAST = require('./__fixtures__/reason-snippet-ast-single');

  const transformedAst = await plugin({ markdownAST }, {});
  expect(transformedAst).toMatchSnapshot();
});

test("it properly transforms multiple reason snippets", async () => {
  const markdownAST = require('./__fixtures__/reason-snippet-ast-multiple');

  const transformedAst = await plugin({ markdownAST }, {});
  expect(transformedAst).toMatchSnapshot();
});

test("it allows declaring dependencies", async () => {
  const markdownAST = require('./__fixtures__/reason-snippet-ast-dependency');

  const transformedAst = await plugin({ markdownAST }, {});
  expect(transformedAst).toMatchSnapshot();
});

test('it only processes reason snippets', async () => {
  const markdownAST = require('./__fixtures__/mixed-snippet-ast');

  const transformedAst = await plugin({ markdownAST }, {});
  const codeCount = transformedAst.children.filter(node => node.type === 'code').length;
  const htmlCount = transformedAst.children.filter(node => node.type === 'html').length;

  expect(codeCount).toBe(3);
  expect(htmlCount).toBe(1);
});
