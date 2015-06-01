var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');

var path = {
  HTML: 'src/index.html',
  MINIFIED_OUT: 'build.min.js',
  OUT: 'build.js',
  DEST: 'dist',
  DEST_BUILD: 'dist/build',
  DEST_SRC: 'dist/src',
  ENTRY_POINT: './src/js/App.js'
};

// ------ development ------

gulp.task('replaceHTMLdebug', function(){
  gulp.src(path.HTML)
    .pipe(htmlreplace({
      'js': 'src/' + path.OUT
    }))
    .pipe(gulp.dest(path.DEST));
});

gulp.task('watch', function(){
  // Watch on src/index.html; if change, perform replaceHTMLsrc.
  gulp.watch(path.HTML, ['replaceHTMLdebug']);

  // Watchify will cache your files and only update the ones that need to be updated.
  var watcher = watchify(browserify({
    entries: [path.ENTRY_POINT], // browserify will take care other child components from ENTRY_POINT.
    transform: [reactify], 
    debug: true, // this tells browserify to use source maps. Error will point to the line number in our JSX file rather than our transpiled JS file
    cache: {}, packageCache: {}, fullPaths: true // it’s needed in order to use watchify.
  }));

  return watcher.on('update', function(){
    watcher.bundle() // concatenates all of our different components into one file and does some browserify magic to make the module.exports/requires work.
      .pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST_SRC));
      console.log('Updated');
  })
  // first call 'gulp watch' our code will bundle and pipe itself to the dist folder even before a change is made.
  // then any changes made to our JS files after that will just overwrite the initial bundled code
  .bundle() 
  .pipe(source(path.OUT))
  .pipe(gulp.dest(path.DEST_SRC));
});

// Entry task of gulp. (Remember to install gulp globally with npm flag -g)
gulp.task('default', ['replaceHTMLdebug', 'watch']);

// ------ production ------

gulp.task('build', function(){
  browserify({
    entries: [path.ENTRY_POINT],
    transform: [reactify]
  })
  .bundle()
  .pipe(source(path.MINIFIED_OUT))
  .pipe(streamify(uglify()))
  .pipe(gulp.dest(path.DEST_BUILD))
});

gulp.task('replaceHTML', function(){
  gulp.src(path.HTML)
    .pipe(htmlreplace({
      'js': 'build/' + path.MINIFIED_OUT
    }))
    .pipe(gulp.dest(path.DEST));
});

gulp.task('production', ['replaceHTML', 'build']);
