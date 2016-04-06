var gulp = require('gulp');
var Path = require('path');
var gutil = require('gulp-util');
var config = require('../config');
var assets = require('./assets');
var rename = require('gulp-rename');
var through = require('through2');

function postURI(post) {
  var date = post.date.toArray().slice(0,3);
  date[1] += 1;
  date = date.map(function(n) { return n.toString(); });

  var path;
  path = Path.join.apply(null, date);
  path = Path.join(path, post.slug.substring(0,30));
  return Path.join("post", path);
}

function inject(contents, posts) {
  posts.forEach(function(post) {
    contents += "\n";
    contents += "== link:/" + postURI(post) + "[" + post.title + "]";
    contents += "\n";
    contents += post.description || "Placeholder text";
    contents += "\n";
    if(post.sectioned) {
      contents += "link:/" + postURI(post) + "[Continue reading...]";
      contents += "\n";
    }
  });
  return contents;
}

module.exports.attachMetadata = function() {
  return through.obj(function(file, enc, cb) {
    try {
      file._post = assets.postMetadata(file);
    } catch (err) {
      throw new gutil.PluginError("Post", err.message);
    }
    cb(null, file);
  });
}

module.exports.inject = function(all) {
  return through.obj(function(file, enc, cb) {
    assets.posts(function(files) {
      if(!all) files = files.slice(0, config.feedLength || 10);
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
