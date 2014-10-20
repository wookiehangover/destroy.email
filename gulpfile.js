var gulp = require('gulp');
var less = require('gulp-less');
var exec = require('child_process').exec;
var sourcemaps = require('gulp-sourcemaps');

gulp.task('less', function() {
  gulp.src('assets/less/main.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
  var child = exec('npm run dev');
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  process.on('exit', function(code) {
    child.exit(code);
  });
  child.on('exit', function(code) {
    process.exit(code);
  });

  gulp.watch('assets/less/**/*.less', ['less']);
});

gulp.task('default', ['less', 'watch']);
