var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var base64 = require('gulp-base64'); // for converting pics
var font64 = require('gulp-cssfont64'); // for converting fonts
var runSequence = require('run-sequence');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var exec = require('gulp-exec');

var arrJs = [      
  'js/vue.min.js',
  'js/iview.min.js',
  'js/jquery.min.js',
  'js/jquery-ui.min.js',
  'js/jquery.ztree.all.min.js',
  'js/base.js'
];

// Disable the 'possible EventEmitter memory leak detected' warning.
gulp.setMaxListeners(0);

// 合并 css 及内嵌的字体、背景图文件（首页Logo和地球背景图除外）
// css-purge 后需要手动退出！
// 压缩合并后的文件：gulp css-min
gulp.task('css', function(callback) {
  runSequence(
    ['css-ztree', 'css-jqueryui', 'css-font64', 'css-base'],
    'css-merge', 'css-min', 
    callback);
});

gulp.task("js",function(){
    // 压缩合并 js 为 ssui.min.js
    // 耗时约 1-2 分钟！
    return gulp.src(arrJs)
      .pipe(concat('ssui.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./dist'));   
});

gulp.task("js-dev",function(){
    // 压缩合并 js 为 ssui.min.js
    // 耗时约 1-2 分钟！
    return gulp.src(arrJs)
      .pipe(concat('ssui.min.js'))
      .pipe(gulp.dest('./dist'));   
});

gulp.task('css-base', function () {
    return gulp.src('./css/base.css')
        .pipe(base64())
        .pipe(concat('base.css'))
        .pipe(gulp.dest('./css/dist'));
});

gulp.task('css-ztree', function () {
    return gulp.src('./css/ztree/zTreeStyle/zTreeStyle.css')
        .pipe(base64())
        .pipe(concat('./ztree.css'))        
        .pipe(gulp.dest('./css/dist'));
});

gulp.task('css-jqueryui', function () {
    return gulp.src([
      './css/jquery-ui.structure.min.css',
      './css/jquery-ui.theme.min.css'
      ])
      .pipe(base64())
      .pipe(concat('jquery-ui.css'))    
      .pipe(gulp.dest('./css/dist'));
});

gulp.task('css-font64', function () {
    return gulp.src('./css/fonts/Ionicons.ttf')
        .pipe(font64())
        .pipe(gulp.dest('./css/dist'));
});

gulp.task('css-merge', function () {
    return gulp.src([
      './css/iview.css',
      './css/dist/ztree.css',      
      './css/dist/jquery-ui.css',
      './css/dist/base.css',
      './css/dist/Ionicons.css'
      ])
      .pipe(concat('ssui.css'))
      .pipe(gulp.dest('./css/dist'));
});

gulp.task('css-min', function () {
    return gulp.src('./css/dist/ssui.css')
      .pipe(cssmin())
      .pipe(rename('ssui.min.css'))
      .pipe(gulp.dest('./dist'));
});

// 似乎不兼容 @-moz-document url-prefix() {...}
// 暂停使用！
gulp.task('css-purge', function(cb) {
  var options = {
    continueOnError: false, // default = false, true means don't emit error event
    pipeStdout: false // default = false, true means stdout is written to file.contents 
  };
  var reportOptions = {
  	err: true, // default = true, false means don't write err 
  	stderr: true, // default = true, false means don't write stderr 
  	stdout: true // default = true, false means don't write stdout 
  }
  gulp.src('./css/dist/ssui.css')
    .pipe(exec('css-purge -i <%= file.path %> -o ./css/dist/ssui.purged.css', options));
  return gulp.src('./css/dist/ssui.purged.css');
});



