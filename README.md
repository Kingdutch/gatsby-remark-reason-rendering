# gatsby-remark-reason-rendering

A gatsby-remark plugin that will compile and embed the reason code snippet files 
in your Markdown files.

## Usage
Add the plugin as dependency to your gatsby project.
```shell script
# yarn
yarn add gatsby-remark-reason-rendering
# npm
npm install --save gatsby-remark-reason-rendering
```

Add the plugin to your `gatsby-config.js` as `gatsby-transformer-remark` plugin. 
```javascript
{
  resolve: 'gatsby-transformer-remark',
  options: {
    plugins: [
      'gatsby-remark-reason-rendering',
    ],
  },
}
```

## Annotations
The behaviour of the code snippet compilation and embedding can be controlled by 
adding annotations to docblocks in the snippet.

Annotations are directives prefixed by the `@` symbol.

### Prelude
The prelude annotation controls how your script is run while being embedded. The
default prelude is `react-component` which will import your Reason snippet as if 
it's a React component and render it without arguments.

An example of using the `none` prelude which simply imports your snippet 
without any extra setup.

```reason
/**
 * @prelude none
 */
type console;
[@bs.val] external con : console = "console"
[@bs.send] external jsLog: (console, string) => unit = "log"

jsLog(con, "This will print a message to the console in your browser but show nothing");
```  

The current preludes shipped with this plugin are:
- `none`
- `react-component`

### Dependency
To specify additional dependencies for a code snippet, create a docblock that 
contains a `dependency` annotation.  

For example the following snippet depends on the on the 
`gatsby-remark-reason-rendering-test` package.
```reason
/**
 * @dependency gatsby-remark-reason-rendering-test
 */

Console.log("Hello World");
```

`reason-react` is added as a dependency for all snippets by default.

## Plugin configuration
The plugin itself does not support any configuration.