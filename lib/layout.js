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
  return h('div#sidebar', [
    h('h1', [ h('a', {href: "/"}, config.title) ]),
    h('h2', config.subtitle),
    h('a', {href: "/resume"}, 'Resume'),
    h('a', {href: "/posts"}, 'Posts'),
    h('div', 'Code:'),
    h('a', {href: "https://packagecontrol.io/packages/Libsass%20Build"}, 'Libsass Build'),
    social(['github', 'twitter', 'linkedin']),
    h('p', [
      'Custom built from',
      h('br'),
      h('a', {href:"https://github.com/blitzrk/asciidoc-blog"}, 'blitzrk/asciidoc-blog')
    ]),
    h('p', '© ' + moment().format('YYYY') + ' ' + config.name)
  ])
}

function render(content, scripts, posts) {
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
      sidebar(posts),
      h('div.article', [
        h('div#content', [
          content
        ])
      ])
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
