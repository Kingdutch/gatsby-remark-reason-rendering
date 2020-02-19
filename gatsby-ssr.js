const React = require('react');
/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

// You can delete this file if you're not using it
exports.onRenderBody = ({ setPreBodyComponents }) => {
  setPreBodyComponents([
    <script
      key={"react"}
      crossOrigin={"true"}
      src="https://unpkg.com/react@16/umd/react.development.js"></script>,
    <script
      key={"react-dom"}
      crossOrigin={"true"}
      src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>,
  ]);
};
