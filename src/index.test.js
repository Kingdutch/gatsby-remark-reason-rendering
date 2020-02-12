const remark = require('remark')
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
