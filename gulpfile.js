var gulp = require('gulp');
var sass = require('gulp-sass');
var post = require('./lib/post');
var Path = require('path');
var order = require('gulp-order');
var layout = require('./lib/layout');
var concatCss = require('gulp-concat-css');
var webserver = require('gulp-webserver');
var asciidoctor = require('gulp-asciidoctor');

var dst = process.argv[3].substr(3);
var cfg = () => Object.assign({}, require(dst+'/../config.json'),
                              {_blogroot: Path.join(dst,'..')});

gulp.task('home', function() {
  return gulp.src('index.adoc')
    .pipe(post.inject(cfg()))
    .pipe(asciidoctor({ header_footer: false }))
    .pipe(layout(cfg()))
    .pipe(gulp.dest(dst))
});

gulp.task('posts', function() {
  return gulp.src(dst+'/../_posts/**/*.adoc')
    .pipe(post.attachMetadata())
    .pipe(asciidoctor({ header_footer: true, attributes: ['nofooter'] }))
    .pipe(layout(cfg()))
    .pipe(post.rename())
    .pipe(post.dest(dst))
});

gulp.task('allposts', function() {
  return gulp.src('all.adoc')
    .pipe(post.inject(cfg(), 'all'))
    .pipe(asciidoctor({ header_footer: false }))
    .pipe(layout(cfg()))
    .pipe(post.rename())
    .pipe(gulp.dest(dst+'/posts'))
});

gulp.task('adoc', ['home', 'posts', 'allposts']);

gulp.task('style', function() {
  return gulp.src([dst+'/../_assets/sass/**/*', './_assets/sass/**/*'])
    .pipe(sass({ includePaths: ['_assets/sass/'] }).on('error', sass.logError))
    .pipe(order([])) // Alphabetize
    .pipe(concatCss('bundle.css'))
    .pipe(gulp.dest(dst+'/css'))
});

gulp.task('static', ['adoc'], function() {
  return gulp.src(dst+'/../_assets/static/**/*')
    .pipe(gulp.dest(dst))
});

gulp.task('build', ['adoc', 'style', 'static']);

gulp.task('serve', ['build'], function() {
  return gulp.src(dst)
    .pipe(webserver({
      host: '0.0.0.0',
      port: 8000
    }))
});

gulp.task('watch', function() {
  gulp.watch([dst+'/../config.json'], ['adoc']);
  gulp.watch([dst+'/../**/*.adoc', './**/*.adoc', '!./README.adoc'], ['adoc']);
  gulp.watch([dst+'/../_assets/sass/**/*', './_assets/sass/**/*'], ['style']);
  gulp.watch([dst+'/../_assets/static/**/*'], ['static']);
});

gulp.task('default', ['watch','serve']);
