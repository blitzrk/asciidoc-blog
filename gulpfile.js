var gulp = require('gulp');
var sass = require('gulp-sass');
var post = require('./lib/post');
var order = require('gulp-order');
var layout = require('./lib/layout');
var concatCss = require('gulp-concat-css');
var webserver = require('gulp-webserver');
var asciidoctor = require('gulp-asciidoctor');

gulp.task('layout', function() {
  return gulp.src(['*.adoc', '!README.adoc'])
    .pipe(post.inject())
    .pipe(asciidoctor({ header_footer: false }))
    .pipe(layout())
    .pipe(gulp.dest('dist'))
});

gulp.task('posts', function() {
  return gulp.src('./_posts/**/*.adoc')
    .pipe(post.attachMetadata())
    .pipe(asciidoctor({ header_footer: false }))
    .pipe(layout())
    .pipe(post.rename())
    .pipe(post.dest('dist'))
});

gulp.task('adoc', ['layout', 'posts']);

gulp.task('style', function() {
  return gulp.src('_assets/sass/**/*')
    .pipe(sass({ includePaths: ['_assets/sass/'] }).on('error', sass.logError))
    .pipe(order([])) // Alphabetize
    .pipe(concatCss('bundle.css'))
    .pipe(gulp.dest('dist/css'))
});

gulp.task('js', ['layout'], function() {
  return gulp.src('_assets/js/**/*')
    .pipe(gulp.dest('dist/js'))
});

gulp.task('build', ['adoc', 'style', 'js']);

gulp.task('serve', ['build'], function() {
  return gulp.src('dist')
    .pipe(webserver({
      host: '0.0.0.0',
      port: 8000
    }))
});

gulp.task('watch', function() {
  gulp.watch(['./**/*.adoc', '!README.adoc'], ['adoc']);
  gulp.watch('_assets/sass/**/*', ['style']);
  gulp.watch('_assets/js/**/*', ['js']);
});

gulp.task('default', ['watch','serve']);
