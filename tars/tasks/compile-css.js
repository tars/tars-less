var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var autoprefixer = require('gulp-autoprefixer');
var replace = require('gulp-replace-task');
var notify = require('gulp-notify');
var tarsConfig = require('../../../tars-config');
var notifier = require('../../helpers/notifier');
var browserSync = require('browser-sync');

var lessFilesToConcatinate = [
        './markup/' + tarsConfig.fs.staticFolderName + '/less/normalize.less',
        './markup/' + tarsConfig.fs.staticFolderName + '/less/libraries/**/*.less',
        './markup/' + tarsConfig.fs.staticFolderName + '/less/libraries/**/*.css',
        './markup/' + tarsConfig.fs.staticFolderName + '/less/mixins.less',
        './markup/' + tarsConfig.fs.staticFolderName + '/less/spritesLess/sprite96.less',
        './markup/' + tarsConfig.fs.staticFolderName + '/less/spritesLess/sprite.less'
    ];

var useAutoprefixer = false;
var helperStream;
var mainStream;
var ie9Stream;

if (tarsConfig.autoprefixerConfig) {
    useAutoprefixer = true;
}

if (tarsConfig.useSVG) {
    lessFilesToConcatinate.push(
        './markup/' + tarsConfig.fs.staticFolderName + '/less/spritesLess/svg-fallback-sprite.less',
        './markup/' + tarsConfig.fs.staticFolderName + '/less/spritesLess/svg-sprite.less'
    );
}

lessFilesToConcatinate.push(
    './markup/' + tarsConfig.fs.staticFolderName + '/less/fonts.less',
    './markup/' + tarsConfig.fs.staticFolderName + '/less/vars.less',
    './markup/' + tarsConfig.fs.staticFolderName + '/less/GUI.less',
    './markup/' + tarsConfig.fs.staticFolderName + '/less/common.less',
    './markup/' + tarsConfig.fs.staticFolderName + '/less/plugins/**/*.less',
    './markup/' + tarsConfig.fs.staticFolderName + '/less/plugins/**/*.css',
    './markup/modules/*/*.less'
);

/**
 * Less compilation
 * @param  {object} buildOptions
 */
module.exports = function(buildOptions) {

    var patterns = [];

    patterns.push(
        {
            match: '%=staticPrefix=%',
            replacement: tarsConfig.staticPrefix
        }
    );

    return gulp.task('css:compile-css', function() {

        helperStream = gulp.src(scssFilesToConcatinate);
        mainStream = helperStream.pipe(addsrc.append('./markup/' + tarsConfig.fs.staticFolderName + '/scss/etc/**/*.less'));
        ie9Stream = helperStream.pipe(
                                addsrc.append([
                                        './markup/modules/*/ie/ie9.less',
                                        './markup/' + tarsConfig.fs.staticFolderName + '/scss/etc/**/*.less'
                                    ])
                            );

        mainStream
            .pipe(concat('main' + buildOptions.hash + '.css'))
            .pipe(replace({
                patterns: patterns,
                usePrefix: false
            }))
            .pipe(less())
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while compiling css.\nLook in the console for details.\n' + error;
            }))
            .pipe(
                gulpif(useAutoprefixer,
                    autoprefixer(
                        {
                            browsers: tarsConfig.autoprefixerConfig,
                            cascade: true
                        }
                    )
                )
            )
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while autoprefixing css.\nLook in the console for details.\n' + error;
            }))
            .pipe(gulp.dest('./dev/' + tarsConfig.fs.staticFolderName + '/css/'))
            .pipe(browserSync.reload({stream:true}))
            .pipe(
                notifier('Less-files\'ve been compiled')
            );

        return ie9Stream
            .pipe(plumber())
            .pipe(concat('main_ie9' + buildOptions.hash + '.css'))
            .pipe(replace({
                patterns: patterns,
                usePrefix: false
            }))
            .pipe(less())
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while compiling css for ie9.\nLook in the console for details.\n' + error;
            }))
            .pipe(autoprefixer('ie 9', { cascade: true }))
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while autoprefixing css.\nLook in the console for details.\n' + error;
            }))
            .pipe(gulp.dest('./dev/' + tarsConfig.fs.staticFolderName + '/css/'))
            .pipe(browserSync.reload({stream:true}))
            .pipe(
                notifier('Less-files for ie9 have been compiled')
            );
    });
};