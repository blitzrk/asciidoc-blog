var gulp = require('gulp');
var sass = require('gulp-sass');
var post = require('./post');
var order = require('gulp-order');
var layout = require('./layout');
var concatCss = require('gulp-concat-css');
var webserver = require('gulp-webserver');
var asciidoctor = require('gulp-asciidoctor');

gulp.task('layout', function() {
  return gulp.src(['*.adoc', '!README.adoc'])
    .pipe(post.inject())
    .pipe(asciidoctor({
      header_footer: false,
      attributes: ['showtitle', 'stylesdir=/css', 'stylesheet=bundle.css']
    }))
    .pipe(layout())
    .pipe(gulp.dest('dist'))
});

gulp.task('posts', function() {
  return gulp.src('./_posts/**/*.adoc')
    .pipe(post())
    .pipe(asciidoctor({
      header_footer: true,
      attributes: ['showtitle', 'stylesdir=/css', 'stylesheet=bundle.css']
    }))
    .pipe(post.rename())
    .pipe(post.dest('dist'))
});

gulp.task('adoc', ['layout', 'posts']);

gulp.task('style', function() {
  return gulp.src(['_css/**/*', '_sass/**/*'])
    .pipe(sass({ includePaths: ['./_sass/'] }).on('error', sass.logError))
    .pipe(order([])) // Alphabetize
    .pipe(concatCss('bundle.css'))
    .pipe(gulp.dest('dist/css'))
});

gulp.task('build', ['adoc', 'style']);

gulp.task('serve', ['build'], function() {
  return gulp.src('dist')
    .pipe(webserver({
      host: '0.0.0.0',
      port: 8000
    }))
});

gulp.task('watch', function() {
  gulp.watch(['./**/*.adoc', '!README.adoc'], ['adoc']);
  gulp.watch(['_sass/**/*', '_css/**/*'], ['style']);
});

gulp.task('default', ['watch','serve']);
