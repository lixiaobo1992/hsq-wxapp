const gio = require('./gio-minp/index.js').default;
const gioConfig = {
  projectId: 'ae08570d515c7766',
  appId: 'wxa090d3923fde0d4b',
  version: '1.0',
};

function gioInit() {
  gio('setConfig', gioConfig);
};

module.exports = {
  gioInit,
  gio,
}