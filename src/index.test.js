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

test("it properly transforms a single reason snippet", () => {
  const markdownAST = require('./__fixtures__/reason-single-snippet-ast');

  return plugin(
    { markdownAST },
    {}
  ).then(transformedAst => {
    expect(transformedAst).toMatchSnapshot();
  });
});