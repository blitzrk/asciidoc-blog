var h = require('virtual-dom/h');
var fs = require('fs');
var config = require('../config');
var fromHTML = require('html-to-vdom')({
  VNode: require('virtual-dom/vnode/vnode'),
  VText: require('virtual-dom/vnode/vtext')
});

function icon(key) {
  return config[key] &&
    h('li.social-link', [
      h('a', {href: config[key]}, [
        fromHTML(fs.readFileSync(__dirname+'/../_assets/social/'+key+'.html').toString())
      ])
    ]);
}

module.exports = function(keys) {
  return h('ul.social-links', keys.map(icon))
}
