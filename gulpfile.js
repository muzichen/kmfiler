var gulp = require('gulp')
,   sass = require('gulp-sass')
,   sourcemaps = require('gulp-sourcemaps')
,   autoprefixer = require('gulp-autoprefixer')
,   imagemin = require('gulp-imagemin')
,   browserSync = require('browser-sync').create()
,   config = require('./config.js');

/**
 * html task 
 */
gulp.task('html', function() {
    return gulp 
        .src(config.paths.html.src)
        .pipe(browserSync.reload({
            stream : true
        }));
});

/**
 * sass to css task
 */
gulp.task('sass', function() {
    return gulp
        .src(config.paths.style.src)
        .pipe(sourcemaps.init())
        .pipe(sass(config.sassOptions)).on('error', sass.logError)
        .pipe(autoprefixer(config.autoprefixerOptions))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.paths.style.dist))
        .pipe(browserSync.reload({
            stream : true
        }))
});
/**
 * javascript task
 */
gulp.task('js', function() {
    return gulp
        .src(config.paths.js.src)
        .pipe(gulp.dest(config.paths.js.dist))
        .pipe(browserSync.reload({
            stream : true
        }));
});
/**
 * images task
 */
gulp.task('images', function() {
    return gulp
        .src(config.paths.image.src)
        .pipe(imagemin())
        .pipe(gulp.dest(config.paths.image.dist))
        .pipe(browserSync.reload({
            stream : true
        }));
});
/**
 * livereload task
 */
gulp.task('browserSync', function() {
    browserSync.init({
        server : {
            baseDir : './'
        }
    })
});
/**
 * task watch
 */
gulp.task('watch', ['browserSync'], function() {
    gulp.watch(config.paths.style.src, ['sass']);
    gulp.watch(config.paths.js.src, ['js']);
    gulp.watch(config.paths.html.src, ['html']);
    gulp.watch(config.paths.image.src, ['images']);
});
/**
 * default task
 */
gulp.task('default', ['watch']);