/**
 * @file
 *
 * Wrap the page element in a custom element that executes the JavaScript
 * every time the elements are reloaded.
 */
// Only do something in development.
const note = document.head.querySelector('meta[name="note"]');
if (note && note.getAttribute('content') === "environment=development") {
  const React = require("react");

  /**
   * Re-renders a script tag so that it's executed by the browser.
   *
   * Script tags added through `innerHtml` assignment aren't executed. Script tags
   * that are appended using the DOM API are executed. To make sure the scripts
   * added by markdown documents during Gatsby develop mode work they need to be
   * removed and re-appended.
   *
   * @param {HTMLElement} node
   *   The script element to rerender.
   */
  function rerenderScriptTag(node) {
    // Find the surrounding elements.
    let parentNode = node.parentNode;
    let nextSibling = node.nextSibling;
    // Create a replacement script tag with the same contents.
    let newScript = document.createElement("script");
    newScript.innerHTML = node.innerHTML;
    newScript.className = node.className;
    // Remove our script tag so it's never duplicated.
    parentNode.removeChild(node);
    // Insert our new element at the place of the old node.
    parentNode.insertBefore(newScript, nextSibling);
  }

  /**
   * A React component that selectively runs script children.
   *
   * Will find and re-insert any elements with the class
   * `gatsby-remark-reason-rendering-script-unprocessed` as script tags and
   * execute them.
   *
   * @param children
   *   The Gatsby component tree.
   */
  const RunJavascript = function ({children}) {
    const wrapper = React.useRef(null);
    React.useLayoutEffect(() => {
      const { current } = wrapper;
      window.el = current;
      // Nothing to do if we're not rendered yet.
      if (current) {
        const scriptElements = wrapper.current.getElementsByClassName('gatsby-remark-reason-rendering-script');
        for (let node of scriptElements) {
          rerenderScriptTag(node);
        }
      }
    });

    return <div ref={wrapper}>{children}</div>;
  };

  // TODO: Disable this outside of development mode where scripts just run.
  exports.wrapPageElement = ({ element }) => {
    return (
      <RunJavascript>
        {element}
      </RunJavascript>
    );
  };
}
