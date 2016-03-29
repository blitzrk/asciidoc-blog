var h = require('virtual-dom/h');
var gutil = require('gulp-util');
var config = require('./config');
var through = require('through2');
var toHTML = require('vdom-to-html');
var fromHTML = require('html-to-vdom')({
  VNode: require('virtual-dom/vnode/vnode'),
  VText: require('virtual-dom/vnode/vtext')
});
var VSN = require('asciidoctor.js')().Asciidoctor().$$scope.VERSION;

function render(content) {
  return h('html', [
    h('head', [
      h('meta', {charset: "UTF-8"}),
      h('meta', {name: "viewport", content: "width=device-width, initial-scale=1.0"}),
      h('meta', {name: "generator", content: "Asciidoctor "+VSN}),
      h('title', config.title),
      h('link', {rel: "stylesheet", href: config.css})
    ]),
    h('body.article', [
      h('div#content', [
        content
      ])
    ])
  ])
}

module.exports = function() {
  return through.obj(function(file, enc, cb) {
    var contents = file.contents.toString();
    var vtree = fromHTML(contents);
    var html = toHTML(render(vtree));
    file.contents = new Buffer(html)
    cb(null, file);
  });
}
