# gatsby-remark-reason-rendering

![npm](https://img.shields.io/npm/v/gatsby-remark-reason-rendering?style=flat-square)
![npm](https://img.shields.io/npm/dm/gatsby-remark-reason-rendering?color=blue&style=flat-square)

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

Install a compatible version of `bs-platform`. This is required to allow the use 
of Reason in the Gatsby project. bs-platform requires the same version to be 
used throughout a project.
```shell script
# yarn
yarn add bs-platform@^7
# npm
npm install --save bs-platform@^7
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

## Known Limitations

### React/ReactDOM
This plugin currently always adds the development build of React/ReactDOM to the 
page from the unpkgd CDN. This ensures that React snippets work. Work needs to 
be done to make this configurable and swap to the production build when Gatsby
is building for deployment.
