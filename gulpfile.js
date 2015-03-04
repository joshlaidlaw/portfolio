var gulp = require('gulp');
var watch = require('gulp-watch');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

var mainBowerFiles = require('main-bower-files');
var gulpFilter = require('gulp-filter');

// CSS/SCSS
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

// Javascript
var concat = require('gulp-concat');
var minify = require('gulp-minify');

// Images
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "dist"
        }
    });

    gulp.watch("scss/**/*.scss", ['sass']);
    gulp.watch("dist/*.html").on('change', reload);
});

gulp.task('sass', function () {
  gulp.src('scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({stream:true}));
});

gulp.task('scripts', function() {
  gulp.src(['bower_components/**/*.js', '!bower_components/**/Gruntfile.js', '!bower_components/**/*.min.js', '!bower_components/**/gulpfile.js' ])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(reload({stream:true}));
});

gulp.task('images', function () {
  gulp.src('images/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('dist', ['sass', 'images'], function() {
  // Do stuff
});

gulp.task('default', ['browser-sync'], function() {

  // place code for your default task here
});