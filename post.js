var fs = require('fs');
var gulp = require('gulp');
var Path = require('path');
var slug = require('slug');
var walk = require('walk');
var gutil = require('gulp-util');
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

  return {
    title: header[0] && header[0].startsWith('= ') && header[0].substring(2, 
      header[0].includes(':') ? header[0].lastIndexOf(':') : header[0].length).trim(),
    author: header[1] && header[1].split(';')[0].split('<')[0].trim(),
    email: header[1] &&
      header[1].substring(header[1].indexOf('<')+1, header[1].indexOf('>')).trim(),
    date: header[2] && header[2].substring(
        header[2].startsWith('v') ? header[2].indexOf(',') + 1 : 0,
        header[2].includes(':') ? header[2].indexOf(':') : header[2].length).trim()
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

function posts(cb) {
  var files = [];
  var walker = walk.walk('./_posts');

  walker.on('file', function(root, stat, next) {
    files.push(new File({
      cwd: "/",
      base: Path.join("/", root),
      path: Path.join("/", root, stat.name),
      contents: fs.readFileSync(Path.join(__dirname, root, stat.name))
    }));
    next();
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

function inject(contents, files) {
  files.forEach(function(file) {
    contents += "\n";
    contents += "== " + file.title;
    contents += "\n";
    contents += file.description || "Placeholder text";
    contents += "\n";
  });
  return contents
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

module.exports.inject = function(n) {
  var number = n || 10;

  return through.obj(function(file, enc, cb) {
    posts(function(files) {
      var files = files.slice(0, n);
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
    var date = file._post.date.toArray().slice(0,3);
    date[1] += 1;
    date = date.map(function(n) { return n.toString(); });

    var path;
    path = Path.join.apply(null, date);
    path = Path.join(path, file._post.slug.substring(0,30));
    return Path.join(dir, "post", path);
  });
};
