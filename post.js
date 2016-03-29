var gulp = require('gulp');
var Path = require('path');
var slug = require('slug');
var gutil = require('gulp-util');
var moment = require('moment');
var rename = require('gulp-rename');
var through = require('through2');

function extract(file) {
  if(file.isNull()) return {};
  if(file.isStream()) throw new Error('Does not support file streams');

  var header = {};
  var contents = file.contents.toString();
  if(contents.startsWith("<<<")) {
    var lines = contents.split("\n").slice(1);
    header = lines.slice(0, lines.indexOf('<<<'))
      .map(function(s){ return s.split(":") })
      .reduce(function(acc, arr) {
        acc[arr[0]] = arr[1].trim();
        return acc;
      }, {});
    contents = lines.slice(lines.indexOf('<<<')+1).join('\n');
  }

  file.contents = new Buffer(contents);
  return header;
}

function header(file) {
  var post = extract(file) || {}
  if(! post.title || ! post.author || ! post.date) {
    throw new Error(file.relative + " requires a header with title, author, and date");
  }

  post.slug = slug(post.title);
  post.date = moment(post.date);

  file._post = post;
  return file;
}

module.exports = function() {
  return through.obj(function(file, enc, cb) {
    try {
      file = header(file);
    } catch (err) {
      throw new gutil.PluginError("Post", err.message);
    }
    cb(null, file);
  });
}

module.exports.rename = function() {
  return rename('index.html');
}

module.exports.dest = function(dir) {
  return gulp.dest(function(file) {
    var date = file._post.date.toArray().slice(0,3);
    date[1] += 1;
    date = date.map(function(n) { return n.toString(); });

    var path;
    path = Path.join.apply(null, date);
    path = Path.join(path, file._post.slug.substring(0,30));
    return Path.join(dir, "post", path);
  });
};
