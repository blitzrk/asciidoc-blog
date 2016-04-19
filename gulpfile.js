var gulp = require('gulp');
var sass = require('gulp-sass');
var post = require('./lib/post');
var order = require('gulp-order');
var layout = require('./lib/layout');
var concatCss = require('gulp-concat-css');
var webserver = require('gulp-webserver');
var asciidoctor = require('gulp-asciidoctor');

gulp.task('home', function() {
  return gulp.src('index.adoc')
    .pipe(post.inject())
    .pipe(asciidoctor({ header_footer: false }))
    .pipe(layout())
    .pipe(gulp.dest('dist'))
});

gulp.task('posts', function() {
  return gulp.src('./_posts/**/*.adoc')
    .pipe(post.attachMetadata())
    .pipe(asciidoctor({ header_footer: true, attributes: ['nofooter'] }))
    .pipe(layout())
    .pipe(post.rename())
    .pipe(post.dest('dist'))
});

gulp.task('allposts', function() {
  return gulp.src('all.adoc')
    .pipe(post.inject('all'))
    .pipe(asciidoctor({ header_footer: false }))
    .pipe(layout())
    .pipe(post.rename())
    .pipe(gulp.dest('dist/posts'))
});

gulp.task('adoc', ['home', 'posts', 'allposts']);

gulp.task('style', function() {
  return gulp.src('_assets/sass/**/*')
    .pipe(sass({ includePaths: ['_assets/sass/'] }).on('error', sass.logError))
    .pipe(order([])) // Alphabetize
    .pipe(concatCss('bundle.css'))
    .pipe(gulp.dest('dist/css'))
});

gulp.task('static', ['adoc'], function() {
  return gulp.src('_assets/static/**/*')
    .pipe(gulp.dest('dist'))
});

gulp.task('build', ['adoc', 'style', 'static']);

gulp.task('serve', ['build'], function() {
  return gulp.src('dist')
    .pipe(webserver({
      host: '0.0.0.0',
      port: 8000
    }))
});

gulp.task('watch', function() {
  gulp.watch(['./**/*.adoc', '!./README.adoc'], ['adoc']);
  gulp.watch('_assets/sass/**/*', ['style']);
  gulp.watch('_assets/static/**/*', ['static']);
});

gulp.task('default', ['watch','serve']);
