var h = require('virtual-dom/h');
var fs = require('fs');
var Path = require('path');
var config = require('../config');
var fromHTML = require('html-to-vdom')({
  VNode: require('virtual-dom/vnode/vnode'),
  VText: require('virtual-dom/vnode/vtext')
});

function icon(link) {
  var tmpl = Path.join(__dirname, '../_assets/social/', link[0]+'.html');

  return fs.existsSync(tmpl) &&
    h('li.social-link', [
      h('a', {href: link[1]}, [
        fromHTML(fs.readFileSync(tmpl).toString())
      ])
    ]);
}

module.exports = function() {
  return config.social
    && h('ul.social-links', config.social.map(icon).filter(function(a){return !!a;}))
}
