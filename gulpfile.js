/*global -$ */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var nunjucksRender = require('gulp-nunjucks-render');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var pngquant = require('imagemin-pngquant');
var critical = require('critical');


gulp.task('nunjucks', function() {
  nunjucksRender.nunjucks.configure(['html/templates/']);

  // Gets .html and .nunjucks files in pages
  return gulp.src('html/pages/**/*.+(html|nunjucks)')
  // Renders template with nunjucks
  .pipe(nunjucksRender())
  // output files in app folder
  .pipe(gulp.dest('dist'));
});

gulp.task('styles', function () {
  return gulp.src('scss/main.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({stream:true}));
});

gulp.task('jshint', function () {
  return gulp.src('js/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('html', ['styles'], function () {
  var assets = $.useref.assets({searchPath: ['dist', '.']});

  return gulp.src('dist/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  gulp.src('images/*')
    .pipe($.cache($.imagemin({
        progressive: true,
        interlaced: true,
        use: [pngquant()],
        svgoPlugins: [{
            removeViewBox: false,
            cleanupIDs: false
        }]
    })))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('fonts/**/*'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'dist/*.*',
    '!dist/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('dist', ['sass', 'images'], function() {
  // Do stuff
});

gulp.task('clean', require('del').bind(null, ['dist']));

gulp.task('serve', ['styles', 'fonts'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  // watch for changes
  gulp.watch([
    'dist/*.html',
    'dist/scripts/**/*.js',
    'dist/images/**/*',
    'dist/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('scss/**/*.scss', ['styles']);
  gulp.watch('dist/fonts/**/*', ['fonts']);
  gulp.watch('html/**/*', ['nunjucks']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('copystyles', function () {
  return gulp.src(['dist/css/main.css'])
  .pipe($.rename({
    basename: 'site' // site.css
  }))
  .pipe(gulp.dest('dist/css'));
});

gulp.task('critical', ['build', 'copystyles'], function () {
  critical.generateInline({
    base: 'dist/',
    src: 'index.html',
    styleTarget: 'css/main.css',
    htmlTarget: 'index.html',
    width: 320,
    height: 1200,
    minify: true
  });
});

gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('dist/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('dist/styles'));

  gulp.src('dist/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', function () {
  gulp.start('build');
});