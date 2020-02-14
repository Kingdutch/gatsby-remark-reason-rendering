const parser = require('./annotation-parser');

test("it properly supports boolean directives", () => {
  const snippet = `
    /**
     * @bool
     */
  `;

  const directives = parser(snippet);
  expect(directives).toEqual({ bool: [true] });
});

test("it properly supports directives with a value", () => {
  const snippet = `
    /**
     * @dependency @kingdutch/gatsby-remark-reason-rendering-test
     */
  `;

  const directives = parser(snippet);
  expect(directives).toEqual(
    {
      dependency: ['@kingdutch/gatsby-remark-reason-rendering-test'],
    }
  );
});

test("it ignores empty lines", () => {
  const snippet = `
    /**
     * 
     */
  `;

  const directives = parser(snippet);
  expect(directives).toEqual({});
});
