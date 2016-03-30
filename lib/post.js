var fs = require('fs');
var gulp = require('gulp');
var Path = require('path');
var slug = require('slug');
var walk = require('walk');
var gutil = require('gulp-util');
var config = require('../config');
var File = require('vinyl');
var moment = require('moment');
var rename = require('gulp-rename');
var through = require('through2');

function extract(file) {
  if(file.isNull()) return {};
  if(file.isStream()) throw new Error('Does not support file streams');

  var contents = file.contents.toString();
  var header = contents.split("\n\n", 1)[0].split('\n')
    .filter(function(line) { return ! line.startsWith(':'); });
  var description = contents.substring(
    contents.indexOf("\n\n"),
    contents.indexOf("=="));

  return {
    title: header[0] && header[0].startsWith('= ') && header[0].substring(2, 
      header[0].includes(':') ? header[0].lastIndexOf(':') : header[0].length).trim(),
    author: header[1] && header[1].split(';')[0].split('<')[0].trim(),
    email: header[1] &&
      header[1].substring(header[1].indexOf('<')+1, header[1].indexOf('>')).trim(),
    date: header[2] && header[2].substring(
      header[2].startsWith('v') ? header[2].indexOf(',') + 1 : 0,
      header[2].includes(':') ? header[2].indexOf(':') : header[2].length).trim(),
    description: description
  };
}

function header(file) {
  var post = extract(file) || {}
  post.date = moment(post.date).isValid() ? moment(post.date) : undefined

  if(! post.title || ! post.author || ! post.date) {
    throw new Error(file.relative + " requires a header with title, author, and date");
  }

  post.slug = slug(post.title);
  file._post = post;
  return file;
}

function postURI(post) {
  var date = post.date.toArray().slice(0,3);
  date[1] += 1;
  date = date.map(function(n) { return n.toString(); });

  var path;
  path = Path.join.apply(null, date);
  path = Path.join(path, post.slug.substring(0,30));
  return Path.join("post", path);
}

function posts(cb) {
  var files = [];
  var walker = walk.walk(Path.join(__dirname, '../_posts'));

  walker.on('file', function(root, stat, next) {
    fs.readFile(Path.join(root, stat.name), function(err, contents) {
      if(err) throw err;

      files.push(new File({
        cwd: "/",
        base: Path.join("/", root),
        path: Path.join("/", root, stat.name),
        contents: contents
      }));
      next();
    });
  });

  walker.on('end', function() {
    files = files.map(function(f) {
      try {
        return header(f)._post;
      } catch (err) {
        throw new gutil.PluginError("Post", err.message);
      }
    });

    cb(files.sort(function(a,b) {
      return (a.date<b.date)-(a.date>b.date) // Most recent first
    }));
  });
}

function inject(contents, posts) {
  posts.forEach(function(post) {
    contents += "\n";
    contents += "== link:/" + postURI(post) + "[" + post.title + "]";
    contents += "\n";
    contents += post.description || "Placeholder text";
    contents += "\n";
  });
  return contents;
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

module.exports.inject = function() {
  return through.obj(function(file, enc, cb) {
    posts(function(files) {
      var files = files.slice(0, config.feedLength || 10);
      var contents = file.contents.toString();
      contents = inject(contents, files);

      file.contents = new Buffer(contents);
      cb(null, file);
    });
  });
}

module.exports.rename = function() {
  return rename('index.html');
}

module.exports.dest = function(dir) {
  return gulp.dest(function(file) {
    return Path.join(dir, postURI(file._post));
  });
};
