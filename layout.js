var h = require('virtual-dom/h');
var gutil = require('gulp-util');
var through = require('through2');
var toHTML = require('vdom-to-html');
var fromHTML = require('html-to-vdom')({
  VNode: require('virtual-dom/vnode/vnode'),
  VText: require('virtual-dom/vnode/vtext')
});

function render(content) {
  return h('html', [
    h('head', [
      h('meta', {charset: "UTF-8"}),
      h('meta', {name: "viewport", content: "width=device-width, initial-scale=1.0"}),
      h('meta', {name: "generator", content: "Asciidoctor 1.5.4"}),
      h('title', 'krieg.io Blog'),
      h('link', {rel: "stylesheet", href: "/css/bundle.css"})
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
