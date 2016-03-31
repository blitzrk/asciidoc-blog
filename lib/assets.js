var fs = require('fs');
var Path = require('path');
var File = require('vinyl');
var gutil = require('gulp-util');
var slug = require('slug');
var walk = require('walk');
var moment = require('moment');
require('string.prototype.startswith');
require('string.prototype.includes');

function extract(file) {
  if(file.isNull()) return {};
  if(file.isStream()) throw new Error('Does not support file streams');

  var contents = file.contents.toString();
  var header = contents.split("\n\n", 1)[0].split('\n')
    .filter(function(line) { return ! line.startsWith(':'); });
  var description = contents.substring(
    contents.indexOf("\n\n") + 2,
    contents.includes("==") ? contents.indexOf("==") : contents.length);

  return {
    title: header[0] && header[0].startsWith('= ') && header[0].substring(2,
      header[0].includes(':') ? header[0].lastIndexOf(':') : header[0].length).trim(),
    author: header[1] && header[1].split(';')[0].split('<')[0].trim(),
    email: header[1] &&
      header[1].substring(header[1].indexOf('<')+1, header[1].indexOf('>')).trim(),
    date: header[2] && header[2].substring(
      header[2].startsWith('v') ? header[2].indexOf(',') + 1 : 0,
      header[2].includes(':') ? header[2].lastIndexOf(':') : header[2].length).trim(),
    description: description
  };
}

function postMetadata(file) {
  var post = extract(file) || {}
  post.date = moment(post.date).isValid() ? moment(post.date) : undefined

  if(! post.title || ! post.author || ! post.date) {
    throw new Error(file.relative + " requires a header with title, author, and date");
  }

  post.slug = slug(post.title);
  return post;
}

module.exports.postMetadata = postMetadata;

module.exports.scripts = function(cb) {
  var scripts = [];
  var walker = walk.walk(Path.join(__dirname, '../_assets/static/js'));

  walker.on('file', function(root, stat, next) {
    scripts.push('/js/'+stat.name);
    next();
  });

  walker.on('end', function() {
    cb(null, scripts);
  });
};

module.exports.posts = function(cb) {
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
        return postMetadata(f);
      } catch (err) {
        throw new gutil.PluginError("Post", err.message);
      }
    });

    cb(files.sort(function(a,b) {
      return (a.date<b.date)-(a.date>b.date) // Most recent first
    }));
  });
}
