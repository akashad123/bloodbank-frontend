const React = require('react');
const ReactDOMServer = require('react-dom/server');

// Mock browser globals
global.window = {};
global.document = {};

require('@babel/register')({
  presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]],
});

try {
  const AdminContacts = require('./src/pages/AdminContacts').default;
  const html = ReactDOMServer.renderToString(React.createElement(AdminContacts));
  console.log("RENDER SUCCESS!");
  console.log(html.substring(0, 100));
} catch (e) {
  console.error("RENDER ERROR:", e);
}
