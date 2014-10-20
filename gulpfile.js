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
  process.stdout.pipe(child.stdout);
  process.stderr.pipe(child.stderr);
  process.on('exit', child.exit);
  child.on('exit', process.exit);

  gulp.watch('assets/less/**/*.less', ['less']);
});

gulp.task('default', ['less', 'watch']);
