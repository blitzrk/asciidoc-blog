var h = require('virtual-dom/h');
var gutil = require('gulp-util');
var config = require('../config');
var social = require('./social');
var assets = require('./assets');
var moment = require('moment');
var through = require('through2');
var toHTML = require('vdom-to-html');
var fromHTML = require('html-to-vdom')({
  VNode: require('virtual-dom/vnode/vnode'),
  VText: require('virtual-dom/vnode/vtext')
});
var VSN = require('asciidoctor.js')().Asciidoctor().$$scope.VERSION;

function js(scripts) {
  return scripts.map(function(src) { return h('script', {src: src}) });
}

function sidebar(posts) {
  var links = config.sidebar.map(function(link) {
    if(link.length != 2 || typeof link[0] !== 'string') return;

    if(typeof link[1] === 'string') {
      return h('a', {href: link[1]}, link[0]);
    } else if (Array.isArray(link[1])) {
      return [ h('div', link[0]) ].concat(link[1].map(function(lnk) {
        if(link.length != 2 || typeof link[0] !== 'string') return;
        return h('a', {href: lnk[1]}, lnk[0]);
      }));
    }
  }).reduce(function(acc, arr) {
    return acc.concat(arr);
  }, []);

  return h('div#sidebar', [
    h('h1', [ h('a', {href: "/"}, config.title) ]),
    h('h2', config.subtitle),
  ].concat(links).concat([
    social(),
    h('p', [
      'Custom built from',
      h('br'),
      h('a', {href:"https://github.com/blitzrk/asciidoc-blog"}, 'blitzrk/asciidoc-blog')
    ]),
    h('p', '© ' + moment().format('YYYY') + ' ' + config.name)
  ]));
}

function render(content, scripts, posts) {
  var generated;
  var html = content.filter(function(node) { return node.tagName === 'html' });
  if(html.length) {
    generated = html[0].children[3].children;
  } else {
    generated = [ h('div#content', [ content ]) ];
  }

  return h('html', [
    h('head', [
      h('meta', {charset: "UTF-8"}),
      h('meta', {name: "viewport", content: "width=device-width, initial-scale=1.0"}),
      h('meta', {name: "generator", content: "Asciidoctor "+VSN}),
      config.title && h('title', config.title),
      config.css && h('link', {rel: "stylesheet", href: config.css}),
      h('link', {
        rel: "stylesheet",
        href: "//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.2.0/styles/default.min.css"
      }),
      h('link', {rel: "icon", type: "image/x-icon", href: "/favicon.ico"})
    ].concat(js(scripts)).concat([
      h('script', {src: "//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.2.0/highlight.min.js"}),
      h('script', 'hljs.initHighlightingOnLoad();'),
      config.https && h('script', 'upgradeToHTTPS();'),
      config.httpsSubdomain && h('script', 'forceHTTPS();')
    ]).filter(function(t){return !!t})),
    h('body', [
      h('div.article', generated),
      sidebar(posts)
    ])
  ])
}

module.exports = function() {
  return through.obj(function(file, enc, cb) {
    var contents = file.contents.toString();
    var vtree = fromHTML(contents);

    assets.scripts(function(err, scripts) {
      assets.posts(function(err, posts) {
        var html = '<!doctype html>\n'+toHTML(render(vtree, scripts, posts));
        file.contents = new Buffer(html)
        cb(null, file);
      });
    });
  });
}
