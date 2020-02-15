import React from 'react';
import ReactDOM from 'react-dom';
import { make as Snippet } from './snippet.bs';

const el = document.createElement("div");

// TODO: Find a way to find the current script in IE 11.
const script = document.currentScript;
script.parentNode.insertBefore(el, script);

ReactDOM.render(React.createElement(Snippet), el);
